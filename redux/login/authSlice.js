import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token:"",
  connectUser: null, // User currently connected in chat
  audioTopic: null, // Topic for audio discussion
  callId: null, // Unique call ID for audio discussion
  isInitiator: false, // Whether the user initiated the audio discussion
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setConnectUser:(state, action) => {
      state.connectUser = action.payload;
    },
    setAudioDiscussion: (state, action) => {
      state.audioTopic = action.payload.topic;
      state.callId = action.payload.callId;
      state.isInitiator = action.payload.isInitiator;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout,setToken,setConnectUser,setAudioDiscussion } = authSlice.actions;
export default authSlice.reducer;