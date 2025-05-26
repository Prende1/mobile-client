import { configureStore } from '@reduxjs/toolkit';
import authReducer from './login/authSlice';
import quizReducer from './quiz/quiz';
import quizScoreReducer from './quiz/quizScore';
import wordReducer from './word/word';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz : quizReducer,
    quizScore : quizScoreReducer,
    word: wordReducer,
  },
});

export default store;