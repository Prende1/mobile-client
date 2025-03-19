import { createSlice } from "@reduxjs/toolkit";

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    quiz: [],
    currentQuizId: null,
  },
  reducers: {
    setQuiz: (state, action) => {
      state.quiz = action.payload; // Setting the job data
    },
    setCurrentQuizId : (state, action) => {
      state.currentQuizId = action.payload
    },
    removeQuiz: (state, action) => {
      state.quiz = state.quiz.filter((quiz) => quiz._id !== action.payload);
    },
  },
});

export const { setQuiz, removeQuiz , setCurrentQuizId } = quizSlice.actions;
export default quizSlice.reducer;
