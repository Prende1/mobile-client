const BASE_URL = "http://192.168.0.107:8000/api"; // Change this to your API server URL

export const API_ROUTES = {
  login: `${BASE_URL}/users`,
  QUIZZES: `${BASE_URL}/quizzes`, // Fetch all quizzes
  getQuizById : (id) => `${BASE_URL}/getQuiz/${id}/questions`,
  QUIZ_BY_ID: (id) => `${BASE_URL}/quiz/${id}`, // Fetch a single quiz by ID
  submitAnswer: `${BASE_URL}/responses`, // Submit a quiz answer
  submitQuizResult: `${BASE_URL}/quiz-results`, // Submit quiz result
};

export default API_ROUTES;
