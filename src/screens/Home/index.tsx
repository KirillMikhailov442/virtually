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
import { Tooltip } from 'antd';
import styles from './Home.module.scss';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import Header from '@/components/Header';
import { SECRET_KEY } from '@/constants/secrets';
import { urlEncode } from '@/helpers/url';

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

  const { push } = useRouter();
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <h5 className={styles.title}>Создать комнату</h5>
        <p className={styles.subtitle}>
          Создайте свою комнату для общения с другими людьми
        </p>
        <form
          onSubmit={handleSubmit(data => {
            const obj = JSON.stringify({
              id: CryptoJS.lib.WordArray.random(4).toString(),
              name: data.name,
              count: data.count,
            });
            const encrypted = CryptoJS.AES.encrypt(obj, SECRET_KEY).toString();

            // const id = v4();
            // Cookies.set(
            //   'room',
            //   JSON.stringify({ id, name: data.name, count: data.count }),
            //   { expires: 1 },
            // );
            push(`/rooms/${urlEncode(encrypted)}`);
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
