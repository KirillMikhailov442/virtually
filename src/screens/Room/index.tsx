import { NextPage } from 'next';
import styles from './Room.module.scss';
import Content from './components/Content';
import RightSidebar from './components/RightSidebar';

const RoomScreen: NextPage = () => {
  return (
    <div className={styles.page}>
      <Content />
      {/* <RightSidebar /> */}
    </div>
  );
};

export default RoomScreen;
