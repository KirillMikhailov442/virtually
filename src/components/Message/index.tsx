import { FC } from 'react';
import styles from './Message.module.scss';
import { Avatar } from '@chakra-ui/react';

export interface MessageProps {
  name?: string;
  messag?: string;
}

const Message: FC<MessageProps> = ({ name, messag }) => {
  return (
    <ul className={styles.message}>
      <Avatar
        className={styles.avatar}
        name="Kent Dodds"
        src="https://bit.ly/kent-c-dodds"
      />
      <div className={styles.name}>
        <p>{name}</p>
      </div>
      <div></div>
      <p className={styles.content}>{messag}</p>
    </ul>
  );
};

export default Message;
