import { SITE_DESCRIPTION, SITE_NAME } from '@configs/seo';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/login',
    display: 'standalone',
    background_color: '#101214',
    theme_color: '#DCDAE7',
    icons: [
      {
        src: '../../public/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '../../public/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '../../public/screenshots/desktop.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'wide',
        label: 'Главный экран на десктопе',
      },
      {
        src: '../../public/screenshots/mobile.jpg',
        sizes: '360x640',
        type: 'image/jpg',
        label: 'Главный экран на мобилке',
      },
    ],
  };
}
