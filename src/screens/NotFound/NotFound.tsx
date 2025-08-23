'use client';

import Button from '@/components/UI/Button';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';

const NotFoundScreen: NextPage = () => {
  const { back } = useRouter();
  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-3">
      <h5>Ничего не найдено</h5>
      <Button size="sm" onClick={back}>
        Обратно
      </Button>
    </div>
  );
};

export default NotFoundScreen;
