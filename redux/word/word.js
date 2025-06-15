import { createSlice, current } from "@reduxjs/toolkit";

const wordSlice = createSlice({
  name: "word",
  initialState: {
    questions: [],
    currentWordId: null,
    currentWord: null, // This can be used to store the current word details if needed
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
    },
    setCurrentWord : (state, action) => {
      state.currentWord = action.payload; // Setting the current word details
    },
  },
});

export const { setQuestions, setCurrentWordId, setCurrentQuestionId,setCurrentWord,setCurrentQuestion  } = wordSlice.actions;
export default wordSlice.reducer;
