'use client';

import { FC, useEffect, useRef, useState } from 'react';
import styles from './Content.module.scss';
import { Avatar, AvatarGroup, useMediaQuery } from '@chakra-ui/react';
import Button from '@/components/UI/Button';
import { MessageCircle, Mic, Monitor, PhoneOff, Video } from 'lucide-react';
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
import VideoPlayer from './Video';
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
  const [peers, setPeers] = useState<
    { id: string; stream: MediaStream; isPlayAudio: boolean }[]
  >([]);
  const [title, setTitle] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerServerRef = useRef<Peer | null>(null);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
    console.log(`Переподключение к пользователю: ${userId}`);

    // Очищаем предыдущий таймаут если он есть
    if (timeoutRefs.current.has(userId)) {
      clearTimeout(timeoutRefs.current.get(userId));
      timeoutRefs.current.delete(userId);
    }

    const call = peerServer.call(userId, stream);

    // Устанавливаем таймаут на 5 секунд
    const timeoutId = setTimeout(() => {
      console.log(`Таймаут подключения к ${userId}, переподключаемся...`);
      call.close();
      reconnectCall(userId, stream, peerServer);
    }, 5000);

    timeoutRefs.current.set(userId, timeoutId);

    call.on('stream', remoteStream => {
      // Успешное подключение - очищаем таймаут
      if (timeoutRefs.current.has(userId)) {
        clearTimeout(timeoutRefs.current.get(userId));
        timeoutRefs.current.delete(userId);
      }

      soundLoading.pause();
      soundSucces.play();
      console.log('Мне передали stream');

      setPeers(prev => {
        // Убираем дубликаты
        const filtered = prev.filter(peer => peer.id !== call.peer);
        return [
          ...filtered,
          { stream: remoteStream, id: call.peer, isPlayAudio: true },
        ];
      });
    });

    call.on('error', error => {
      console.error('Ошибка вызова:', error);
      if (timeoutRefs.current.has(userId)) {
        clearTimeout(timeoutRefs.current.get(userId));
        timeoutRefs.current.delete(userId);
      }

      // Повторная попытка через 2 секунды
      setTimeout(() => {
        reconnectCall(userId, stream, peerServer);
      }, 2000);
    });
  };

  const handleIncomingCall = (call: MediaConnection, stream: MediaStream) => {
    console.log('Кто-то мне звонит, надо ответить');

    // Устанавливаем таймаут на ответ
    const answerTimeout = setTimeout(() => {
      console.log('Таймаут входящего вызова, закрываем');
      call.close();
    }, 5000);

    call.answer(stream);

    call.on('stream', remoteStream => {
      // Успешный ответ - очищаем таймаут
      clearTimeout(answerTimeout);
      console.log('Тот, кто мне позвонил, передал мне stream');

      setPeers(prev => {
        const filtered = prev.filter(peer => peer.id !== call.peer);
        return [
          ...filtered,
          { stream: remoteStream, id: call.peer, isPlayAudio: true },
        ];
      });
    });

    call.on('error', error => {
      console.error('Ошибка входящего вызова:', error);
      clearTimeout(answerTimeout);
    });
  };

  useEffect(() => {
    const peerServer = new Peer({
      host: '/',
      port: 3002,
      // debug: 3,
    });

    peerServerRef.current = peerServer;

    peerServer.on('open', id => {
      socket.emit(ACTIONS_SOCKET.JOIN, {
        roomId,
        userId: id,
      });
    });

    // Получение локального медиапотока
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        setPeers(prev => [
          ...prev.filter(peer => peer.id !== 'me'),
          { stream, id: 'me', isPlayAudio: false },
        ]);

        socket.on('USER_CONNECTED', userId => {
          console.log('Новый пользователь, надо позвонить');
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
      // Очистка при размонтировании
      cleanupTimeouts();
      if (peerServerRef.current) {
        peerServerRef.current.destroy();
      }
      socket.off('USER_CONNECTED');
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
          <VideoPlayer {...peer} key={`${peer.id}-${index}`} />
        ))}
      </div>
      <nav className={styles.nav}>
        {!isLaptop && (
          <div className="empty">
            <Button title="Скопировать ссылку">
              <MessageCircle size={24} />
            </Button>
          </div>
        )}
        <div className={styles.navCenter}>
          <Button title="Микрофон">
            <Mic size={24} />
          </Button>
          <Button title="Камера">
            <Video size={24} />
          </Button>
          <Button title="Камера устройства">
            <Monitor size={24} />
          </Button>
          <Button variant="danger" title="Завершить созвон">
            <PhoneOff size={20} />
          </Button>
          {isLaptop && (
            <Button onClick={() => dispatch(toggleSide())} title="Открыть чат">
              <MessageCircle size={24} />
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
