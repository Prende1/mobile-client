import { createSlice } from "@reduxjs/toolkit";

const wordSlice = createSlice({
  name: "word",
  initialState: {
    questions: [],
    currentWordId: null,
    currentQuestionId: null,
    currentQuestion : null, // This can be used to store the current question details if needed
  },
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload; // Setting the question data
    },
    setCurrentWordId : (state, action) => {
      state.currentWordId = action.payload
    },
    setCurrentQuestionId : (state, action) => {
      state.currentQuestionId = action.payload
    },
    setCurrentQuestion : (state, action) => {
      state.currentQuestion = action.payload; // Setting the current question details
    }
  },
});

export const { setQuestions, setCurrentWordId, setCurrentQuestionId  } = wordSlice.actions;
export default wordSlice.reducer;
