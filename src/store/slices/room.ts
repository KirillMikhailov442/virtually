import { createSlice } from '@reduxjs/toolkit';

const RoomSlice = createSlice({
  name: 'room-slice',
  initialState: {
    sideOpen: false,
  },
  reducers: {
    openSide: state => {
      state.sideOpen = true;
    },
    closeSide: state => {
      state.sideOpen = false;
    },
    toggleSide: state => {
      state.sideOpen = !state.sideOpen;
    },
  },
});

export default RoomSlice.reducer;
export const { openSide, closeSide, toggleSide } = RoomSlice.actions;
