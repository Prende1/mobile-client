const BASE_URL = "https://vocab-server-fkrv.onrender.com/api"; 
// const BASE_URL = "https://192.168.129.252:8000/api";

export const API_ROUTES = {
  login: `${BASE_URL}/users`,
  getUserById: (id) => `${BASE_URL}/users/${id}`, // Fetch user by ID
  getAllUsers: `${BASE_URL}/users`, // Fetch all users
  updateUser: (id) => `${BASE_URL}/users/${id}`, // Update user profile
  startQuizSession: `${BASE_URL}/start-quiz`, // Fetch all quizzes
  getNextQuestion: (quizId) => `${BASE_URL}/next-question/${quizId}`, // Fetch next question in a quiz
  QUIZ_BY_ID: (id) => `${BASE_URL}/quiz/${id}`, // Fetch a single quiz by ID
  submitAnswer: `${BASE_URL}/responses`, // Submit a quiz answer
  submitQuizResult: `${BASE_URL}/quiz-results`, // Submit quiz result
  getWords: `${BASE_URL}/words`,
  addWord: `${BASE_URL}/words`,


  getQuestions: (wordId) => `${BASE_URL}/wordQuestion/${wordId}`, // Fetch questions for a specific word
  getAllQuestions: `${BASE_URL}/wordQuestion`, // Fetch all questions of all words
  getRandomQuestion: `${BASE_URL}/wordQuestion/random`, // Fetch a random question from
  createWordQuestion: `${BASE_URL}/wordQuestion`, // Create a new word question
  deleteWordQuestionById: (id) => `${BASE_URL}/wordQuestion/${id}`, // Delete a word question by ID
  getWordAnswersByWordID: (wordID) => `${BASE_URL}/wordAnswer/word/${wordID}`, // Fetch answers for a specific word by wordID
  getWordAnswers: (wqID) => `${BASE_URL}/wordAnswer/${wqID}`, // Fetch answers for a specific word question
  createWordAnswer: `${BASE_URL}/wordAnswer`, // Create a new word answer
  getRecentQuizAttempts: (userID) => `${BASE_URL}/responses/recent/${userID}`, // Fetch recent quiz attempts by user ID


  likeQuestionOrAnswer : `${BASE_URL}/like/`,
  getLikesDislikes : `${BASE_URL}/like/stats`,
};

export default API_ROUTES;
