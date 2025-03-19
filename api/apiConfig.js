const BASE_URL = "http://192.168.117.252:8000/api"; // Change this to your API server URL

export const API_ROUTES = {
  login: `${BASE_URL}/users`,
  QUIZZES: `${BASE_URL}/quizzes`, // Fetch all quizzes
  QUIZ_BY_ID: (id) => `${BASE_URL}/quiz/${id}`, // Fetch a single quiz by ID
  SUBMIT_QUIZ: `${BASE_URL}/quiz/submit`, // Submit quiz answers
};

export default API_ROUTES;
