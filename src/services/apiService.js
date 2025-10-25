// src/services/apiService.js
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

//helper

function arrayBufferToBase64(buffer) {
  // convert ArrayBuffer -> base64 in chunks to avoid arg length limits
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32k
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Error handling utility
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data?.message || `Server error (${status})`,
      status,
      data: data?.data || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    };
  }
};

// Authentication API
export const authAPI = {
  // User registration
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return {
        success: true,
        data: response.data,
        message: 'Account created successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
        message: 'Login successful',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // User logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw handleApiError(error);
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// File Upload API
export const fileAPI = {
  // Upload file
  async processFile(userId, file, onProgress = () => {}) {
    if (!file) throw new Error('No file provided')

    const formData = new FormData()
    formData.append('pdfFile', file) // adjust field name if backend expects a different key
    formData.append('userId', userId)
    // NOTE: adjust path below if your backend uses another route (see notes)
    const uploadUrl = '/upload' // <-- change here if needed

    const response = await apiClient.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      },
      // increase timeout if needed
      timeout: 5 * 60 * 1000,
    })

    // Successful response expected e.g. { message: 'ok', itemId: '...', ... }
    // If your backend returns the id inside response.data.document.id adjust below
    return response.data
  },
  // Get uploaded files
  getFiles: async () => {
    try {
      const response = await apiClient.get('/files');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete file
  deleteFile: async (fileId) => {
    try {
      const response = await apiClient.delete(`/files/${fileId}`);
      return {
        success: true,
        data: response.data,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Content Generation API
export const contentAPI = {
  // Generate MCQs from file
  generateMCQs: async (fileId, options = {}) => {
    try {
      const response = await apiClient.post(`/content/generate-mcqs/${fileId}`, options);
      return {
        success: true,
        data: response.data,
        message: 'MCQs generated successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Generate flashcards from file
  generateFlashcards: async (fileId, options = {}) => {
    try {
      const response = await apiClient.post(`/content/generate-flashcards/${fileId}`, options);
      return {
        success: true,
        data: response.data,
        message: 'Flashcards generated successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get generated content
  getGeneratedContent: async (contentId) => {
    try {
      const response = await apiClient.get(`/content/${contentId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Save content for revision
  saveContent: async (contentData) => {
    try {
      const response = await apiClient.post('/content/save', contentData);
      return {
        success: true,
        data: response.data,
        message: 'Content saved successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get saved content
  getSavedContent: async (type) => {
    try {
      const response = await apiClient.get(`/content/saved/${type}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete saved content
  deleteSavedContent: async (contentId) => {
    try {
      const response = await apiClient.delete(`/content/saved/${contentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getSavedMCQs : async (userId) => {
    try {
      const response = await apiClient.get('/fetch/mcqs', {
        params: { userId },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getSavedNotes : async (userId) => {
    try {
      const response = await apiClient.get('/fetch/notes', {
        params: { userId },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getSavedFCs : async (userId) => {
    try {
      const response = await apiClient.get('/fetch/flashcards', {
        params: { userId },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  deleteSavedMCQ : async (userId, itemId) => {
    console.log(userId, itemId);
    
    try {
      const response = await apiClient.delete(`/delete/mcqs`, {
        params : {userId, itemId},
      });
      return {
        success: true,
        data: response.data,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }    
  },
  deleteSavedNote : async (userId, itemId) => {
    console.log(userId, itemId);
    
    try {
      const response = await apiClient.delete(`/delete/notes`, {
        params : {userId, itemId},
      });
      return {
        success: true,
        data: response.data,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }    
  },
  deleteSavedFC : async (userId, itemId) => {
    console.log(userId, itemId);
    
    try {
      const response = await apiClient.delete(`/delete/flashcards`, {
        params : {userId, itemId},
      });
      return {
        success: true,
        data: response.data,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }    
  },
  loadSavedMCQ: async (userId, itemId) => {
    try {
      const response = await apiClient.get(`/load/mcqs`, {
        params : {userId, itemId},
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  loadSavedNote : async (userId, itemId) => {
    if (!userId || !itemId) {
      throw new TypeError("loadSavedNote: userId and itemId are required");
    }

    try {
      // ask for binary so we can detect & handle PDF bytes
      const res = await apiClient.get('/export', {
        params: { userId, itemId },
        responseType: 'arraybuffer', // <-- important
      });

      // If server responded with a non-2xx, surface readable message
      if (res.status < 200 || res.status >= 300) {
        const serverMsg =
          res.data && (res.data.error || res.data.message)
            ? (res.data.error || res.data.message)
            : res.statusText;
        throw new Error(`Failed to load note: ${res.status} ${serverMsg}`);
      }

      const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';

      // If backend returned a PDF (binary), convert to base64 and return a consistent shape
      if (contentType.includes('application/pdf')) {
        const base64 = arrayBufferToBase64(res.data);

        // try to derive filename from header if present
        const cd = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
        let filename = 'export.pdf';
        const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i);
        if (m && m[1]) filename = decodeURIComponent(m[1].replace(/['"]/g, ''));

        return { pdfBase64: base64, filename };
      }

      // Otherwise treat response as JSON text (server might have returned JSON note)
      // res.data is an ArrayBuffer containing JSON text; decode and parse
      const text = new TextDecoder('utf-8').decode(res.data || new Uint8Array());
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // If parsing fails, return raw text
        parsed = text;
      }

      if (!parsed) {
        throw new Error('Server returned empty response when loading the note');
      }

      return parsed;
    } catch (err) {
      // Axios error with response (server returned non-2xx)
      if (err && err.response) {
        const status = err.response.status;
        const body = err.response.data;
        const serverMsg =
          body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body);
        throw new Error(`Server error (${status}): ${serverMsg}`);
      }

      // Request made but no response received
      if (err && err.request) {
        throw new Error('No response from server. Network error or server is unreachable.');
      }

      // Other errors
      throw new Error(`Failed to load saved note: ${err && err.message ? err.message : err}`);
    }
  },
  loadSavedFC: async (userId, itemId) => {
    try {
      const response = await apiClient.get(`/load/flashcards`, {
        params : {userId, itemId},
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  async generateNotes(userId, itemId, options = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    
    // POST body; adjust the route/body to match your backend.
    console.log(userId, itemId);
    //generate the notes first 
    const task = 'notes';
    const resp0 = await apiClient.get('/generate', {
      params : {
        userId,
        itemId,
        task,
      }
    });
    
    const resp = await apiClient.get('/export', {
      params: {
        userId,
        itemId,
      },
      timeout: 5 * 60 * 1000, // 5 minutes
      responseType: 'arraybuffer', // Handle binary PDF data
    });
    
    // Check if the response is a PDF by looking at content-type or data
    const contentType = resp.headers['content-type'] || resp.headers['Content-Type'] || '';
    
    if (contentType.includes('application/pdf') || 
        (resp.data instanceof ArrayBuffer && resp.data.byteLength > 0)) {
      // Return the raw ArrayBuffer for PDF processing
      return resp.data;
    } else {
      // Try to parse as JSON for structured data
      try {
        const text = new TextDecoder('utf-8').decode(resp.data);
        return JSON.parse(text);
      } catch (e) {
        // If parsing fails, return the raw data
        return resp.data;
      }
    }
  },

  // Generate notes structure (first step - JSON response)
  async generateNotesStructure(userId, itemId, options = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    
    console.log('Generating notes structure:', userId, itemId);
    
    const task = 'notes';
    const resp = await apiClient.get('/generate', {
      params: {
        userId,
        itemId,
        task,
        ...options
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'Notes structure generated successfully',
    };
  },

  // Export notes PDF (second step - PDF response)
  async exportNotesPDF(userId, itemId) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    
    console.log('Exporting notes PDF:', userId, itemId);
    
    const resp = await apiClient.get('/export', {
      params: {
        userId,
        itemId,
      },
      timeout: 5 * 60 * 1000, // 5 minutes
      responseType: 'arraybuffer', // Handle binary PDF data
    });
    
    // Check if the response is a PDF by looking at content-type or data
    const contentType = resp.headers['content-type'] || resp.headers['Content-Type'] || '';
    
    if (contentType.includes('application/pdf') || 
        (resp.data instanceof ArrayBuffer && resp.data.byteLength > 0)) {
      // Return the raw ArrayBuffer for PDF processing
      return {
        success: true,
        data: resp.data,
        message: 'PDF exported successfully',
      };
    } else {
      throw new Error('Expected PDF response but received different content type');
    }
  },

  // Generate MCQs structure (first step - JSON response)
  async generateMCQsStructure(userId, itemId, options = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    
    console.log('Generating MCQs structure:', userId, itemId);
    
    const task = 'mcqs';
    const resp = await apiClient.get('/generate', {
      params: {
        userId,
        itemId,
        task,
        ...options
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'MCQs structure generated successfully',
    };
  },


  // Generate flashcards structure (first step - JSON response)
  async generateFlashcardsStructure(userId, itemId, options = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    
    console.log('Generating flashcards structure:', userId, itemId);
    
    const task = 'flashcards';
    const resp = await apiClient.get('/generate', {
      params: {
        userId,
        itemId,
        task,
        ...options
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'Flashcards structure generated successfully',
    };
  },


  /**
   * saveContent(userId, itemId, type, data)
   * - type: 'notes' | 'mcq' | 'flashcards' etc.
   * - data: object containing title, content, summary, keyPoints, etc.
   */
  async saveNote(userId, itemId, itemName, document = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!itemName) throw new Error('Missing item name')
      console.log("document", document);
      
    const url = '/save/notes' // <-- change if backend uses a different save route
    const body = {
      userId,
      itemId,
      itemName,
      document,
    }

    const resp = await apiClient.post(url, body, { timeout: 60 * 1000 })
    return resp.data
  },

  // Save MCQ for revision
  async saveMCQ(userId, itemId, itemName, document = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!itemName) throw new Error('Missing item name')
    console.log("MCQ document", document);
    
    const url = '/save/mcqs'
    const body = {
      userId,
      itemId,
      itemName,
      document,
    }

    const resp = await apiClient.post(url, body, { timeout: 60 * 1000 })
    return resp.data
  },

  // Save Flashcard for revision
  async saveFlashcard(userId, itemId, itemName, document = {}) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!itemName) throw new Error('Missing item name')
    console.log("Flashcard document", document);
    
    const url = '/save/flashcards'
    const body = {
      userId,
      itemId,
      itemName,
      document,
    }

    const resp = await apiClient.post(url, body, { timeout: 60 * 1000 })
    return resp.data
  },

  // Follow-up API for notes
  async followUpNotes(userId, itemId, prompt) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!prompt) throw new Error('Missing prompt')
    
    console.log('Follow-up notes:', userId, itemId, prompt);
    
    const resp = await apiClient.post('/follow-up', {
      prompt: prompt
    }, {
      params: {
        userId: userId,
        itemId: itemId,
        task: 'notes'
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'Notes follow-up completed successfully',
    };
  },

  // Follow-up API for MCQs
  async followUpMCQs(userId, itemId, prompt) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!prompt) throw new Error('Missing prompt')
    
    console.log('Follow-up MCQs:', userId, itemId, prompt);
    
    const resp = await apiClient.post('/follow-up', {
      prompt: prompt
    }, {
      params: {
        userId: userId,
        itemId: itemId,
        task: 'mcqs'
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'MCQs follow-up completed successfully',
    };
  },

  // Follow-up API for flashcards
  async followUpFlashcards(userId, itemId, prompt) {
    if (!userId) throw new Error('Missing userId')
    if (!itemId) throw new Error('Missing itemId')
    if (!prompt) throw new Error('Missing prompt')
    
    console.log('Follow-up flashcards:', userId, itemId, prompt);
    
    const resp = await apiClient.post('/follow-up', {
      prompt: prompt
    }, {
      params: {
        userId: userId,
        itemId: itemId,
        task: 'flashcards'
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      success: true,
      data: resp.data,
      message: 'Flashcards follow-up completed successfully',
    };
  },
};

// Session Management API
export const sessionAPI = {
  // Create new session
  createSession: async (sessionData) => {
    try {
      const response = await apiClient.post('/sessions', sessionData);
      return {
        success: true,
        data: response.data,
        message: 'Session created successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      const response = await apiClient.get('/sessions/current');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update session progress
  updateSessionProgress: async (sessionId, progress) => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}/progress`, { progress });
      return {
        success: true,
        data: response.data,
        message: 'Progress updated successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}/end`);
      return {
        success: true,
        data: response.data,
        message: 'Session ended successfully',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get session history
  getSessionHistory: async () => {
    try {
      const response = await apiClient.get('/sessions/history');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// User Statistics API
export const statsAPI = {
  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get study analytics
  getStudyAnalytics: async (period = 'week') => {
    try {
      const response = await apiClient.get(`/stats/analytics?period=${period}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Export the main API object
export default {
  auth: authAPI,
  file: fileAPI,
  content: contentAPI,
  session: sessionAPI,
  stats: statsAPI,
};
