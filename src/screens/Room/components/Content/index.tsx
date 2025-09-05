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

  useEffect(() => {
    const bytes = CryptoJS.AES.decrypt(urlDecode(roomId), SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      back();
    }
    const obj = JSON.parse(decryptedString) as { id: string; name: string };
    setTitle(obj.name);
  }, []);

  useEffect(() => {
    const peerServer = new Peer({
      host: '/',
      port: 3002,
      debug: 3,
    });

    peerServer.on('open', id => {
      socket.emit(ACTIONS_SOCKET.JOIN, {
        roomId,
        userId: id,
      });
    });

    peerServer.on('connection', () => {
      console.log('Соединились!');
    });

    // Получение локального медиапотока
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        await setPeers(prev => [
          ...prev,
          { stream, id: 'me', isPlayAudio: false },
        ]);

        await socket.on('USER_CONNECTED', userId => {
          console.log('Новый пользователь, надо позвонить');
          soundLoading.play();
          const call = peerServer.call(userId, stream);

          call.on('stream', remoteStream => {
            soundLoading.pause();
            soundSucces.play();
            console.log('Мне передали stream');
            setPeers(prev => [
              ...prev,
              { stream: remoteStream, id: call.peer, isPlayAudio: true },
            ]);
          });
        });

        await peerServer.on('call', call => {
          console.log('Кто-то мне звонит, надо ответить');
          call.answer(stream);

          call.on('stream', remoteStream => {
            console.log('Тот, кто мне позвонил, передал мне stream');
            setPeers(prev => [
              ...prev,
              { stream: remoteStream, id: call.peer, isPlayAudio: true },
            ]);
          });
        });
      } catch (err) {
        toast.warning('Вы не дали достум к медиа');
      }
    };

    getVideo();

    // Обработка входящих вызовов
    // peerServer.on('call', call => {
    //   if (!localStream) return;
    //   console.log('Кто-то звонит надо ответить');

    //   call.answer(localStream);
    // call.on('stream', remoteStream => {
    //   setPeers(prev => {
    //     if (!prev.some(peer => peer.id === call.peer)) {
    //       return [
    //         ...prev,
    //         {
    //           id: call.peer,
    //           stream: remoteStream,
    //           isPlayAudio: true,
    //         },
    //       ];
    //     }
    //     return prev;
    //   });
    // });
    // });

    // Обработка подключения новых пользователей
    // const handleUserConnected = (userId: string) => {
    //   if (!localStream || userId == peerServer.id) return;
    //   console.log('Кто-то подключился, надо позвонить');

    //   const call = peerServer.call(userId, localStream);
    // call.on('stream', remoteStream => {
    //   setPeers(prev => {
    //     if (!prev.some(peer => peer.id === call.peer)) {
    //       return [
    //         ...prev,
    //         {
    //           id: call.peer,
    //           stream: remoteStream,
    //           isPlayAudio: true,
    //         },
    //       ];
    //     }
    //     return prev;
    //   });
    // });
    // };

    // socket.on('USER_CONNECTED', handleUserConnected);
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
          <VideoPlayer {...peer} key={index} />
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
