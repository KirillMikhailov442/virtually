'use client';

import { store } from '@/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ConfigProvider } from 'antd';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: 'var(--primary-100)',
        color: 'var(--secondary-80)',
      },
    }),
  },
});

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "'Manrope', sans-serif",
          },
        }}>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </ConfigProvider>
    </Provider>
  );
};

export default Providers;
