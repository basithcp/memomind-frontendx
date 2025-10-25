// Content Generation API - Now integrated with backend
import { contentAPI as backendContentAPI, fileAPI } from '../services/apiService';

export const contentAPI = {
  // Generate MCQs from uploaded content
  generateMCQs: async (userId, itemId, options = {}) => {
    try {
      const result = await backendContentAPI.generateMCQs(userId, itemId, options);
      return result.data;
    } catch (error) {
      console.error('Error generating MCQs:', error);
      throw error;
    }
  },

  // Generate flashcards from uploaded content
  generateFlashcards: async (userId, itemId, options = {}) => {
    try {
      const result = await backendContentAPI.generateFlashcards(userId, itemId, options);
      return result.data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  },

  // Process uploaded file
  processFile: async (file) => {
    try {
      const result = await fileAPI.uploadFile(file);
      return result.data;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  },

  // Get generated content
  getGeneratedContent: async (userId, itemId, type) => {
    try {
      const result = await backendContentAPI.getGeneratedContent(userId, itemId, type);
      return result.data;
    } catch (error) {
      console.error('Error getting generated content:', error);
      throw error;
    }
  },

  // Save content for revision
  saveContent: async (userId, itemId, type, contentData) => {
    try {
      const result = await backendContentAPI.saveContent(userId, itemId, type, contentData);
      return result.data;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  },

  // Get saved content
  getSavedContent: async (userId, type) => {
    try {
      const result = await backendContentAPI.getSavedContent(userId, type);
      return result.data;
    } catch (error) {
      console.error('Error getting saved content:', error);
      throw error;
    }
  },
  //new : Get saved mcqs
  getSavedMCQs: async (userId) => {
    try {
      const result = await backendContentAPI.getSavedMCQs(userId);
      return result.data;
    } catch (error) {
      console.error('Error getting saved content:', error);
      throw error;
    }    
  },
  //new : Get saved notes
  getSavedNotes: async (userId) => {
    try {
      const result = await backendContentAPI.getSavedNotes(userId);
      return result.data;
    } catch (error) {
      console.error('Error getting saved content:', error);
      throw error;
    }    
  },
  //new : Get saved mcqs
  getSavedFCs: async (userId) => {
    try {
      const result = await backendContentAPI.getSavedFCs(userId);
      return result.data;
    } catch (error) {
      console.error('Error getting saved content:', error);
      throw error;
    }    
  },
  //new : Delete a saved mcq
  deleteSavedMCQ: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.deleteSavedMCQ(userId, itemId);
      return result.data;
    } catch (error) {
      console.error('Error deleting saved content:', error);
      throw error;
    }        
  },
  //new : Delete a saved notes
  deleteSavedNote: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.deleteSavedNote(userId, itemId);
      return result.data;
    } catch (error) {
      console.error('Error deleting saved content:', error);
      throw error;
    }        
  },
  //new : Delete a saved flashcards
  deleteSavedFC: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.deleteSavedFC(userId, itemId);
      return result.data;
    } catch (error) {
      console.error('Error deleting saved content:', error);
      throw error;
    }        
  },
  // Delete saved content
  deleteSavedContent: async (userId, itemId, type) => {
    try {
      const result = await backendContentAPI.deleteSavedContent(userId, itemId, type);
      return result.data;
    } catch (error) {
      console.error('Error deleting saved content:', error);
      throw error;
    }
  },
  // Get saved content
  loadSavedMCQ: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.loadSavedMCQ(userId, itemId);
      return result.data;
    } catch (error) {
      console.error('Error loading saved content:', error);
      throw error;
    }
  },
  loadSavedNote: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.loadSavedNote(userId, itemId);   
      return result;
    } catch (error) {

      console.error('Error loading saved content:', error);
      throw error;
    }
  },
  loadSavedFC: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.loadSavedFC(userId, itemId);      
      return result.data;
    } catch (error) {
      console.error('Error loading saved content:', error);
      throw error;
    }
  },
  async generateNotes(userId, itemId, options = {}) {
    try {
      const result = await backendContentAPI.generateNotes(userId, itemId, options);      
      return result;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  },

  // Generate notes structure (first step)
  generateNotesStructure: async (userId, itemId, options = {}) => {
    try {
      const result = await backendContentAPI.generateNotesStructure(userId, itemId, options);
      return result.data;
    } catch (error) {
      console.error('Error generating notes structure:', error);
      throw error;
    }
  },

  // Export notes PDF (second step)
  exportNotesPDF: async (userId, itemId) => {
    try {
      const result = await backendContentAPI.exportNotesPDF(userId, itemId);
      return result.data;
    } catch (error) {
      console.error('Error exporting notes PDF:', error);
      throw error;
    }
  },

  // Generate MCQs (single step)
  generateMCQsStructure: async (userId, itemId, options = {}) => {
    try {
      const result = await backendContentAPI.generateMCQsStructure(userId, itemId, options);
      return result.data;
    } catch (error) {
      console.error('Error generating MCQs:', error);
      throw error;
    }
  },

  // Generate flashcards (single step)
  generateFlashcardsStructure: async (userId, itemId, options = {}) => {
    try {
      const result = await backendContentAPI.generateFlashcardsStructure(userId, itemId, options);
      return result.data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  },

  /**
   * saveContent(userId, itemId, type, data)
   * - type: 'notes' | 'mcq' | 'flashcards' etc.
   * - data: object containing title, content, summary, keyPoints, etc.
   */
  async saveNote(userId, itemId, itemName, document = {}) {
    try {
      const result = await backendContentAPI.saveNote(userId, itemId, itemName, document);      
      return result;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  },

  // Save MCQ for revision
  saveMCQ: async (userId, itemId, itemName, document = {}) => {
    try {
      const result = await backendContentAPI.saveMCQ(userId, itemId, itemName, document);
      return result.data;
    } catch (error) {
      console.error('Error saving MCQ:', error);
      throw error;
    }
  },

  // Save Flashcard for revision
  saveFlashcard: async (userId, itemId, itemName, document = {}) => {
    try {
      const result = await backendContentAPI.saveFlashcard(userId, itemId, itemName, document);
      return result.data;
    } catch (error) {
      console.error('Error saving flashcard:', error);
      throw error;
    }
  },

  // Follow-up API for notes
  followUpNotes: async (userId, itemId, prompt) => {
    try {
      const result = await backendContentAPI.followUpNotes(userId, itemId, prompt);
      return result.data;
    } catch (error) {
      console.error('Error in notes follow-up:', error);
      throw error;
    }
  },

  // Follow-up API for MCQs
  followUpMCQs: async (userId, itemId, prompt) => {
    try {
      const result = await backendContentAPI.followUpMCQs(userId, itemId, prompt);
      return result.data;
    } catch (error) {
      console.error('Error in MCQs follow-up:', error);
      throw error;
    }
  },

  // Follow-up API for flashcards
  followUpFlashcards: async (userId, itemId, prompt) => {
    try {
      
      const result = await backendContentAPI.followUpFlashcards(userId, itemId, prompt);
      
      console.log(result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error in flashcards follow-up:', error);
      throw error;
    }
  },
}
