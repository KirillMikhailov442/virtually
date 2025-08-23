import { FC } from 'react';
import styles from './Participant.module.scss';
import { Avatar } from '@chakra-ui/react';
import { Ellipsis } from 'lucide-react';
import { Dropdown, MenuProps } from 'antd';

const Participant: FC = () => {
  const items: MenuProps['items'] = [
    {
      label: 'Выгнать',
      key: '0',
      danger: true,
    },
  ];
  return (
    <li className={styles.participant}>
      <Avatar
        className={styles.avatar}
        name="Kent Dodds"
        src="https://bit.ly/kent-c-dodds"
      />
      <p>Кирилл Михайлов</p>
      <Dropdown
        className={styles.dropdown}
        menu={{ items }}
        trigger={['click']}>
        <button className={styles.menu}>
          <Ellipsis size={20} />
        </button>
      </Dropdown>
    </li>
  );
};

export default Participant;
