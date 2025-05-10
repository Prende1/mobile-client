import { createSlice } from "@reduxjs/toolkit";

const quizScoreSlice = createSlice({
  name: "quizScore",
  initialState: {
    quizScore: [],
    // currentQuizId: null,
  },
  reducers: {
    setQuizScore: (state, action) => {
      state.quizScore = action.payload; // Setting the job data
    },
    // setCurrentQuizId : (state, action) => {
    //   state.currentQuizId = action.payload
    // },
    // removeQuiz: (state, action) => {
    //   state.quiz = state.quiz.filter((quiz) => quiz._id !== action.payload);
    // },
  },
});

export const { setQuizScore  } = quizScoreSlice.actions;
export default quizScoreSlice.reducer;
