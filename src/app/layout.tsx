import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '@styles/globals.css';
import Providers from '@layouts/Providers';
import 'react-spring-bottom-sheet/dist/style.css';
import { Toaster } from 'sonner';
import favicon from '@public/favicon.ico';
import { SITE_DESCRIPTION, SITE_NAME } from '@/configs/seo';
const manrope = Manrope({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: `${SITE_NAME} | %s`,
    default: `${SITE_NAME} | Создать команту`,
  },
  icons: favicon.src,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
      </head>
      <Providers>
        <body className={`${manrope.className} antialiased`}>
          <Toaster position="top-right" className="custom-toast" />
          {children}
        </body>
      </Providers>
    </html>
  );
}
