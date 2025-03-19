import { configureStore } from '@reduxjs/toolkit';
import authReducer from './login/authSlice';
import quizReducer from './quiz/quiz';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz : quizReducer,
  },
});

export default store;