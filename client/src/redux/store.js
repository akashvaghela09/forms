import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/appSlice';

const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export default store;