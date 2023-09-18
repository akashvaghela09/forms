import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  sidepanelVisible: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setSidepanelVisible: (state, action) => {
      state.sidepanelVisible = action.payload;
    },
  },
});

export const { 
    setEmail,
    setSidepanelVisible,
} = appSlice.actions;

export default appSlice.reducer;