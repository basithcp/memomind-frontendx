// src/config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  FILES: {
    UPLOAD: '/files/upload',
    LIST: '/files',
    DELETE: '/files',
  },
  CONTENT: {
    GENERATE_NOTES: '/content/generate-notes',
    GENERATE_MCQS: '/content/generate-mcqs',
    GENERATE_FLASHCARDS: '/content/generate-flashcards',
    GET_CONTENT: '/content',
    SAVE_CONTENT: '/content/save',
    GET_SAVED: '/content/saved',
    DELETE_SAVED: '/content/saved',
  },
  SESSIONS: {
    CREATE: '/sessions',
    CURRENT: '/sessions/current',
    UPDATE_PROGRESS: '/sessions',
    END: '/sessions',
    HISTORY: '/sessions/history',
  },
  STATS: {
    USER_STATS: '/stats',
    ANALYTICS: '/stats/analytics',
  },
};

