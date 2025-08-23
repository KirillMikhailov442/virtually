'use client';

import { FC, useState } from 'react';
import styles from './RightSidebar.module.scss';
import useAppSelector from '@/hooks/useAppSekector';
import clsx from 'clsx';
import Button from '@/components/UI/Button';
import { X } from 'lucide-react';
import useAppDispatch from '@/hooks/useAppDispatch';
import { closeSide } from '@/store/slices/room';
import { Segmented } from 'antd';
import Chat from './Chat';
import Participants from './Participants';
import { useMediaQuery } from '@chakra-ui/react';
import { BottomSheet } from 'react-spring-bottom-sheet';

const RightSidebar: FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.roomSlice.sideOpen);
  const [isMobile] = useMediaQuery('(max-width: 800px)');
  const [selectedTab, setSelectedTab] = useState<'chat' | 'participants'>(
    'chat',
  );

  if (isMobile)
    return (
      <BottomSheet
        className={styles.bottomSheet}
        open={isOpen}
        snapPoints={({ maxHeight }) => [maxHeight * 0.7]}
        onDismiss={() => dispatch(closeSide())}>
        <div className={styles.bottomSheet}>
          <header className={clsx(styles.header, styles.headerMobile)}>
            <Segmented
              onChange={value =>
                value == 'Чат'
                  ? setSelectedTab('chat')
                  : setSelectedTab('participants')
              }
              className={styles.tabs}
              options={['Чат', 'Участники (4)']}
            />
          </header>
          {selectedTab === 'chat' ? (
            <Chat key={'chat'} />
          ) : (
            <Participants key={'participants'} />
          )}
        </div>
      </BottomSheet>
    );

  return (
    <aside className={clsx(styles.side, isOpen && styles.sideOpen)}>
      <header className={styles.header}>
        <Button
          title="Закрыть чат"
          size="sm"
          className={clsx(styles.close, 'empty')}>
          <X size={16} />
        </Button>
        <Segmented
          onChange={value =>
            value == 'Чат'
              ? setSelectedTab('chat')
              : setSelectedTab('participants')
          }
          className={styles.tabs}
          options={['Чат', 'Участники (4)']}
        />
        <Button
          onClick={() => dispatch(closeSide())}
          title="Закрыть чат"
          size="sm"
          className={styles.close}>
          <X size={16} />
        </Button>
      </header>
      {selectedTab === 'chat' ? (
        <Chat key={'chat'} />
      ) : (
        <Participants key={'participants'} />
      )}
    </aside>
  );
};

export default RightSidebar;
