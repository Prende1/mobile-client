import { createSlice } from "@reduxjs/toolkit";

const wordSlice = createSlice({
  name: "word",
  initialState: {
    questions: [],
    currentWordId: null,
    currentQuestionId: null,
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
  },
});

export const { setQuestions, setCurrentWordId, setCurrentQuestionId  } = wordSlice.actions;
export default wordSlice.reducer;
