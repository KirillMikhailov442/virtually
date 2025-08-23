import { CircularProgress } from '@chakra-ui/react';
import { NextPage } from 'next';

const LoadingScreen: NextPage = () => {
  return (
    <div className="w-full h-[100dvh] flex items-center justify-center gap-3">
      <CircularProgress isIndeterminate color="white" />
    </div>
  );
};

export default LoadingScreen;
