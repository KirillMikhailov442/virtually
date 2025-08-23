'use client';

import { FC } from 'react';
import styles from './Content.module.scss';
import { Avatar, AvatarGroup, useMediaQuery } from '@chakra-ui/react';
import Button from '@/components/UI/Button';
import { MessageCircle, Mic, Monitor, PhoneOff, Video } from 'lucide-react';
import useAppDispatch from '@/hooks/useAppDispatch';
import { toggleSide } from '@/store/slices/room';

const Content: FC = () => {
  const dispatch = useAppDispatch();
  const [isMobile] = useMediaQuery('(max-width: 1024px)');
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="flex items-center gap-3">
          <h5 className={styles.name}>Название комнаты</h5>
          <AvatarGroup size="xs" max={5}>
            <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
          </AvatarGroup>
        </div>
        <div>
          <Avatar
            size="sm"
            name="Kent Dodds"
            src="https://bit.ly/kent-c-dodds"
          />
        </div>
      </header>
      <div className={styles.people}>people</div>
      <nav className={styles.nav}>
        {!isMobile && (
          <div className={'empty'}>
            <Button title="Открыть чат">
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
          {isMobile && (
            <Button onClick={() => dispatch(toggleSide())} title="Открыть чат">
              <MessageCircle size={24} />
            </Button>
          )}
        </div>
        {!isMobile && (
          <Button onClick={() => dispatch(toggleSide())} title="Открыть чат">
            <MessageCircle size={24} />
          </Button>
        )}
      </nav>
    </main>
  );
};

export default Content;
