import clsx from 'clsx';
import { FC, useEffect, useRef } from 'react';
import styles from './Content.module.scss';
import { MicOff, VideoOff } from 'lucide-react';

export interface VideoPlayerProps {
  id: string;
  stream: MediaStream;
  isPlayAudio?: boolean;
  isPlayVideo?: boolean;
  isScreenShare?: boolean;
  isAlone?: boolean;
  me?: boolean;
  name?: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  stream,
  isPlayAudio = true,
  isPlayVideo = true,
  isScreenShare = false,
  isAlone,
  me = false,
  name,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream, isPlayAudio, isPlayVideo]);

  return (
    <div
      className={clsx(
        styles.video,
        isScreenShare && styles.videoScreenShare,
        isAlone && styles.videoAlone,
      )}>
      {isPlayAudio ? (
        <audio ref={audioRef} defaultValue={0.5} muted={me} autoPlay />
      ) : (
        <div className={styles.micOff}>
          <MicOff size={24} />
        </div>
      )}
      {isPlayVideo ? (
        <video muted={true} autoPlay ref={videoRef} />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <VideoOff size={100} />
          <p>Камера отключена</p>
        </div>
      )}
      <div className={styles.name}>{name}</div>
    </div>
  );
};

export default VideoPlayer;
