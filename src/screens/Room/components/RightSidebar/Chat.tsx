import { FC } from 'react';
import styles from './RightSidebar.module.scss';
import Input from '@/components/UI/Input';
import { SendHorizontal } from 'lucide-react';
import Message from '@/components/Message';

const Chat: FC = () => {
  return (
    <div className="flex flex-col grow mt-6 gap-3">
      <div className="flex flex-col grow">
        <p>Чат</p>
        <div className={styles.messages}>
          <Message name="Кирилл Михайлов" messag="Привет! Как дела? :)" />
          <Message name="Кирилл Михайлов" messag="Привет! Как дела? :)" />
          <Message name="Кирилл Михайлов" messag="Привет! Как дела? :)" />
          <Message
            name="Кирилл Михайлов"
            messag="Привет! Как дела? :) тут это, нужно правки сделать немного))"
          />
        </div>
      </div>
      <footer className={styles.footer}>
        <Input
          placeholder="Напишите сообщение"
          rightIcon={<SendHorizontal />}
        />
      </footer>
    </div>
  );
};

export default Chat;
