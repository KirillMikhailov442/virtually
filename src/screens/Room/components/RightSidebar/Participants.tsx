import { FC } from 'react';
import styles from './RightSidebar.module.scss';
import Participant from '@/components/Participant';

const Participants: FC = () => {
  return (
    <div className="flex flex-col grow mt-6">
      <p>Участники</p>
      <ul className={styles.participants}>
        <Participant />
        <Participant />
        <Participant />
        <Participant />
        <Participant />
      </ul>
    </div>
  );
};

export default Participants;
