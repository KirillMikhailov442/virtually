import { SECRET_KEY } from '@/constants/secrets';
import { urlDecode } from '@/helpers/url';
import { RoomScreen } from '@/screens';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CryptoJS from 'crypto-js';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;

  const bytes = CryptoJS.AES.decrypt(urlDecode(id), SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedString) {
    return notFound();
  }

  const obj = JSON.parse(decryptedString) as { name: string };

  return {
    title: obj.name,
  };
};

export default () => <RoomScreen />;
