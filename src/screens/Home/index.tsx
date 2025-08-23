'use client';

import { NextPage } from 'next';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Resolver, useForm } from 'react-hook-form';
import { Github, Send } from 'lucide-react';
import { GITHUB_LINK, TG_LINK } from '@/constants/links';
import { Dropdown, Tooltip } from 'antd';
import styles from './Home.module.scss';
import { Avatar } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const HomeScreen: NextPage = () => {
  const formSchema = z.object({
    name: z
      .string()
      .min(2, 'Название слишком короткое')
      .max(20, 'Название слишком длинное')
      .nonempty({ message: 'Введите название' }),
    count: z.coerce
      .number()
      .min(1, 'Количество не может быть меньше 1')
      .max(4, 'Количество не может быть больше 4'),
  });
  type FormSchema = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
  });

  const { replace } = useRouter();

  return (
    <div className={styles.page}>
      <Link href={'/'} className={styles.logo}>
        <h4>Virtually</h4>
      </Link>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              label: 'Выйти',
              key: 1,
              danger: true,
              onClick: () => {
                sessionStorage.removeItem('user');
                replace('/login');
              },
            },
          ],
        }}>
        <div className={styles.account}>
          {' '}
          <p>
            {JSON.parse(sessionStorage.getItem('user') as string).name}
          </p>{' '}
          <Avatar
            name={JSON.parse(sessionStorage.getItem('user') as string).name}
            size="sm"
          />
        </div>
      </Dropdown>
      <div className={styles.container}>
        <h5 className={styles.title}>Создать комнату</h5>
        <p className={styles.subtitle}>
          Создайте свою комнату для общения с другими людьми
        </p>
        <form
          onSubmit={handleSubmit(data => {
            console.log(data);
          })}
          className={styles.form}>
          <Input
            placeholder="Введите название"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            type="number"
            value={2}
            min={1}
            max={4}
            placeholder="Макс. количество участников"
            {...register('count')}
            error={errors.count?.message}
          />
          <Button disabled={Object.keys(errors).length > 0} variant="white">
            Создать комнату
          </Button>
        </form>
      </div>
      <div className={styles.links}>
        <Tooltip title="Github репозиторий" placement="rightTop">
          <Link target="_blank" href={GITHUB_LINK}>
            <Github size={20} />
          </Link>
        </Tooltip>
        <Tooltip title={'Telegram (@cripperMicher)'}>
          <Link target="_blank" href={TG_LINK}>
            <Send size={20} />
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default HomeScreen;
