import clsx from 'clsx';
import { FC, useEffect, useRef } from 'react';
import styles from './Content.module.scss';

interface VideoPlayerProps {
  stream: MediaStream;
  isPlayAudio: boolean;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ stream, isPlayAudio = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={clsx(styles.video)}>
      {isPlayAudio && <audio ref={audioRef} autoPlay playsInline />}
      <video muted={true} autoPlay ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
