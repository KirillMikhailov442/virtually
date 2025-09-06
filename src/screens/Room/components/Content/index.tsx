'use client';

import { FC, useEffect, useRef, useState } from 'react';
import styles from './Content.module.scss';
import { Avatar, AvatarGroup, useMediaQuery } from '@chakra-ui/react';
import Button from '@/components/UI/Button';
import {
  Link,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Video,
  VideoOff,
} from 'lucide-react';
import useAppDispatch from '@/hooks/useAppDispatch';
import { toggleSide } from '@/store/slices/room';
import useAppSelector from '@/hooks/useAppSekector';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/configs/socket';
import { ACTIONS_SOCKET } from '@/constants/actionsSocket';
import Peer, { MediaConnection } from 'peerjs';
import { toast } from 'sonner';
import { SECRET_KEY } from '@/constants/secrets';
import CryptoJS from 'crypto-js';
import VideoPlayer, { VideoPlayerProps } from './Video';
import { urlDecode } from '@/helpers/url';

const soundLoading = new Audio('/sounds/loading.mp3');
soundLoading.loop = true;
soundLoading.volume = 0.5;

const soundSucces = new Audio('/sounds/success.mp3');
soundSucces.volume = 0.5;

const Content: FC = () => {
  const dispatch = useAppDispatch();
  const isOpenSide = useAppSelector(state => state.roomSlice.sideOpen);
  const [isLaptop] = useMediaQuery('(max-width: 1024px)');
  const roomId = useParams<{ id: string }>().id;
  const { back } = useRouter();
  const [peers, setPeers] = useState<VideoPlayerProps[]>([]);
  const [title, setTitle] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peerServerRef = useRef<Peer | null>(null);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const originalLocalStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const bytes = CryptoJS.AES.decrypt(urlDecode(roomId), SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      back();
    }
    const obj = JSON.parse(decryptedString) as { id: string; name: string };
    setTitle(obj.name);
  }, []);

  const cleanupTimeouts = () => {
    timeoutRefs.current.forEach((timeout, key) => {
      clearTimeout(timeout);
      timeoutRefs.current.delete(key);
    });
  };

  const reconnectCall = (
    userId: string,
    stream: MediaStream,
    peerServer: Peer,
  ) => {
    if (timeoutRefs.current.has(userId)) {
      clearTimeout(timeoutRefs.current.get(userId));
      timeoutRefs.current.delete(userId);
    }

    const call = peerServer.call(userId, stream);

    const timeoutId = setTimeout(() => {
      console.log(`Таймаут подключения к ${userId}, переподключаемся...`);
      call.close();
      reconnectCall(userId, stream, peerServer);
    }, 5000);

    timeoutRefs.current.set(userId, timeoutId);

    call.on('stream', remoteStream => {
      if (timeoutRefs.current.has(userId)) {
        clearTimeout(timeoutRefs.current.get(userId));
        timeoutRefs.current.delete(userId);
      }

      soundLoading.pause();
      soundSucces.play();

      setPeers(prev => {
        const filtered = prev.filter(peer => peer.id !== call.peer);
        return [
          ...filtered,
          {
            stream: remoteStream,
            id: call.peer,
            isPlayAudio: true,
            isPlayVideo: true,
          },
        ];
      });
    });

    call.on('error', error => {
      console.error('Ошибка вызова:', error);
      if (timeoutRefs.current.has(userId)) {
        clearTimeout(timeoutRefs.current.get(userId));
        timeoutRefs.current.delete(userId);
      }

      setTimeout(() => {
        reconnectCall(userId, stream, peerServer);
      }, 2000);
    });
  };

  const handleIncomingCall = (call: MediaConnection, stream: MediaStream) => {
    const answerTimeout = setTimeout(() => {
      call.close();
    }, 5000);

    call.answer(stream);

    call.on('stream', remoteStream => {
      clearTimeout(answerTimeout);
      setPeers(prev => {
        const filtered = prev.filter(peer => peer.id !== call.peer);
        return [
          ...filtered,
          {
            stream: remoteStream,
            id: call.peer,
            isPlayAudio: true,
            isPlayVideo: true,
          },
        ];
      });
    });

    call.on('error', error => {
      clearTimeout(answerTimeout);
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      if (originalLocalStreamRef.current) {
        setLocalStream(originalLocalStreamRef.current);

        setPeers(prev =>
          prev.map(peer =>
            peer.id === 'me'
              ? {
                  ...peer,
                  stream: originalLocalStreamRef.current!,
                  isPlayVideo: true,
                }
              : peer,
          ),
        );

        peers.forEach(peer => {
          if (peer.id !== 'me' && peerServerRef.current) {
            reconnectCall(
              peer.id,
              originalLocalStreamRef.current!,
              peerServerRef.current,
            );
          }
        });
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        setScreenStream(screenStream);
        originalLocalStreamRef.current = localStream;
        setLocalStream(screenStream);

        setPeers(prev =>
          prev.map(peer =>
            peer.id === 'me'
              ? { ...peer, stream: screenStream, isPlayVideo: true }
              : peer,
          ),
        );

        peers.forEach(peer => {
          if (peer.id !== 'me' && peerServerRef.current) {
            reconnectCall(peer.id, screenStream, peerServerRef.current);
          }
        });

        screenStream.getTracks().forEach(track => {
          track.onended = () => {
            toggleScreenShare();
          };
        });

        setIsScreenSharing(true);
      } catch (err) {
        toast.error('Не удалось начать демонстрацию экрана');
      }
    }
  };

  useEffect(() => {
    const peerServer = new Peer({
      host: '/',
      port: 3002,
    });

    peerServerRef.current = peerServer;

    peerServer.on('open', id => {
      socket.emit(ACTIONS_SOCKET.JOIN, {
        roomId,
        userId: id,
      });
    });

    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        setPeers(prev => [
          ...prev.filter(peer => peer.id !== 'me'),
          { stream, id: 'me', isPlayAudio: true, isPlayVideo: true, me: true },
        ]);

        socket.on(ACTIONS_SOCKET.USER_CONNECTED, userId => {
          soundLoading.play();
          reconnectCall(userId, stream, peerServer);
        });

        peerServer.on('call', call => {
          handleIncomingCall(call, stream);
        });
      } catch (err) {
        toast.warning('Вы не дали доступ к медиа');
      }
    };

    getVideo();

    return () => {
      cleanupTimeouts();
      if (peerServerRef.current) {
        peerServerRef.current.destroy();
      }
      socket.off(ACTIONS_SOCKET.USER_CONNECTED);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
      setPeers(prev =>
        prev.map(peer =>
          peer.id === 'me'
            ? { ...peer, stream: localStream, isPlayAudio: !peer.isPlayAudio }
            : peer,
        ),
      );
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      setIsVideoEnabled(prev => !prev);
      setPeers(prev =>
        prev.map(peer =>
          peer.id === 'me'
            ? { ...peer, stream: localStream, isPlayVideo: !peer.isPlayVideo }
            : peer,
        ),
      );
    }
  };

  useEffect(() => {
    socket.emit(ACTIONS_SOCKET.TOGGLE_VIDEO, {
      roomId,
      userId: peerServerRef.current?.id,
      stateVideo: isVideoEnabled,
    });
  }, [isVideoEnabled]);

  useEffect(() => {
    socket.emit(ACTIONS_SOCKET.TOGGLE_AUDIO, {
      roomId,
      userId: peerServerRef.current?.id,
      stateAudio: isAudioEnabled,
    });
  }, [isAudioEnabled]);

  useEffect(() => {
    socket.on(ACTIONS_SOCKET.TOGGLE_AUDIO, ({ userId, stateAudio }) => {
      setPeers(prev =>
        prev.map(peer =>
          peer.id == userId ? { ...peer, isPlayAudio: stateAudio } : peer,
        ),
      );
    });

    socket.on(ACTIONS_SOCKET.TOGGLE_VIDEO, ({ userId, stateVideo }) => {
      setPeers(prev =>
        prev.map(peer =>
          peer.id == userId ? { ...peer, isPlayVideo: stateVideo } : peer,
        ),
      );
    });
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="flex items-center gap-3">
          <h5 className={styles.name}>{title}</h5>
          <AvatarGroup size="xs" max={5}>
            <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
          </AvatarGroup>
        </div>
        <div>
          <Avatar
            size="sm"
            name={JSON.parse(Cookies.get('user') as string).name}
          />
        </div>
      </header>
      <div className={styles.videos}>
        {peers.map((peer, index) => (
          <VideoPlayer
            isAlone={peers.length == 1}
            {...peer}
            key={`${peer.id}-${index}`}
            isScreenShare={isScreenSharing && peer.id === 'me'}
          />
        ))}
      </div>
      <nav className={styles.nav}>
        {!isLaptop && (
          <Button title={`Скопировать ссылку: ${window.location.href}`}>
            <Link size={24} />
          </Button>
        )}
        <div className={styles.navCenter}>
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? 'white' : 'black'}
            title="Микрофон">
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </Button>
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? 'white' : 'black'}
            disabled={isScreenSharing}
            title="Камера">
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </Button>
          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? 'white' : 'black'}
            title={
              isScreenSharing
                ? 'Остановить демонстрацию'
                : 'Демонстрация экрана'
            }>
            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
          </Button>
          <Button variant="danger" title="Завершить созвон">
            <PhoneOff size={20} />
          </Button>
          {isLaptop && (
            <Button onClick={() => dispatch(toggleSide())} title="Открыть чат">
              <MessageCircle size={24} />
            </Button>
          )}
          {isLaptop && (
            <Button title="Скопировать ссылку">
              <Link size={24} />
            </Button>
          )}
        </div>
        {!isLaptop && (
          <Button
            className={clsx(isOpenSide && styles.activeButton)}
            onClick={() => dispatch(toggleSide())}
            title="Открыть чат">
            <MessageCircle size={24} />
          </Button>
        )}
      </nav>
    </main>
  );
};

export default Content;
