import { configureStore } from '@reduxjs/toolkit';
import roomSlice from './slices/room';
export const store = configureStore({
  reducer: {
    roomSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
