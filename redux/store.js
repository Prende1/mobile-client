import { configureStore } from '@reduxjs/toolkit';
import authReducer from './login/authSlice';
import quizReducer from './quiz/quiz';
import quizScoreReducer from './quiz/quizScore';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz : quizReducer,
    quizScore : quizScoreReducer,
  },
});

export default store;