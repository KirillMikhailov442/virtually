'use client';

import { NextPage } from 'next';
import styles from './Login.module.scss';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Github, Send } from 'lucide-react';
import { GITHUB_LINK, TG_LINK } from '@/constants/links';
import { Tooltip } from 'antd';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';

const LoginScreen: NextPage = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const formSchema = z.object({
    name: z
      .string()
      .min(2, 'Имя слишком короткое')
      .max(20, 'Имя слишком длинное')
      .nonempty({ message: 'Введите имя' }),
  });
  type FormSchema = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <h5 className={styles.title}>Придумайте имя</h5>
        <p className={styles.subtitle}>
          Этот аккаунт будет активен, пока вы не выйдите с этого сайта
        </p>
        <form
          onSubmit={handleSubmit(data => {
            const returnUrl = searchParams.get('from') || '/';
            Cookies.set(
              'user',
              JSON.stringify({ name: data.name, id: uuidv4() }),
              {
                expires: 1,
              },
            );
            toast.success('Аккаунт успешно создан');
            setTimeout(() => {
              push(returnUrl);
            }, 500);
          })}
          className={styles.form}>
          <Input
            placeholder="Введите имя"
            {...register('name')}
            error={errors.name?.message}
          />
          <Button disabled={!isValid} variant="white">
            Создать аккаунт
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

export default LoginScreen;
