import { configureStore } from '@reduxjs/toolkit';
import authReducer from './login/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;