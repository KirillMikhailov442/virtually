import { socket } from '@/configs/socket';
import { ACTIONS_SOCKET } from '@/constants/actionsSocket';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOCALE_VIDEO = 'lcoale';
const useWebRTC = (roomId: string) => {
  const [clients, setClients] = useState([]);

  const addNewClient = useCallback(
    (newClient: string) => {
      if (clients.includes(newClient)) return;
      setClients(prev => [...prev, newClient]);
    },
    [clients],
  );

  const peerConnections = useRef({});
  const localMediaStream = useRef(null);
  const peerMediaElements = useRef({
    [LOCALE_VIDEO]: null,
  });

  useEffect(() => {
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      addNewClient(LOCALE_VIDEO);
      const localVideoElement = peerMediaElements.current[LOCALE_VIDEO];
      if (localVideoElement) {
        localVideoElement.volume = 0;
        localVideoElement.srcObject = localMediaStream.current;
      }
    }
    startCapture()
      .then(() => socket.emit(ACTIONS_SOCKET.JOIN, { roomId }))
      .catch(() => console.log('Не выданы права'));
  }, [roomId]);

  return { clients };
};

export default useWebRTC;
