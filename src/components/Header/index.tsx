import { FC, useEffect, useState } from 'react';
import styles from './Header.module.scss';
import Link from 'next/link';
import { Dropdown } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Avatar } from '@chakra-ui/react';
import { socket } from '@/configs/socket';
import { ACTIONS_SOCKET } from '@/constants/actionsSocket';

const Header: FC = () => {
  const { replace } = useRouter();
  const pathName = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.emit(ACTIONS_SOCKET.NUMBER_OF_CONNECTIONS);
  }, [pathName]);

  socket.on(ACTIONS_SOCKET.NUMBER_OF_CONNECTIONS, (number: number) => {
    setCount(number);
  });

  return (
    <header className={styles.header}>
      <Link href={'/'} className={styles.logo}>
        <h4>Virtually</h4>
        <p className={styles.online}>
          сейчас online <span>{count}</span>
        </p>
      </Link>
      {Cookies.get('user') && (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                label: 'Выйти',
                key: 1,
                danger: true,
                onClick: () => {
                  Cookies.remove('user');
                  replace('/login');
                },
              },
            ],
          }}>
          <div className={styles.account}>
            {' '}
            <p>{JSON.parse(Cookies.get('user') as string).name}</p>{' '}
            <Avatar
              name={JSON.parse(Cookies.get('user') as string).name}
              size="sm"
            />
          </div>
        </Dropdown>
      )}
    </header>
  );
};

export default Header;
