# MemoMind Frontend-Backend Integration Guide

## Overview
This document outlines the complete integration between the MemoMind frontend and backend, replacing dummy data with real API calls and implementing comprehensive error handling.

## 🚀 What's Been Implemented

### 1. **Comprehensive API Service Layer**
- **File**: `src/services/apiService.js`
- **Features**:
  - Centralized API configuration with axios interceptors
  - Automatic token management
  - Comprehensive error handling
  - Request/response interceptors for authentication
  - Timeout and retry logic

### 2. **Updated API Modules**
- **`src/api/user.js`**: User management with real backend calls
- **`src/api/sessions.js`**: Session management with backend integration
- **`src/api/content.js`**: Content generation and management
- **`src/services/authService.js`**: Enhanced authentication service

### 3. **Enhanced Components with Real API Integration**

#### **UploadPage.jsx**
- ✅ Real file upload with progress tracking
- ✅ File validation (type, size)
- ✅ Error handling with user-friendly messages
- ✅ File ID passing to generation pages

#### **GenerateNotesPage.jsx**
- ✅ Real content generation API calls
- ✅ Error handling and loading states
- ✅ Save functionality with backend integration
- ✅ File ID parameter handling

#### **GenerateMCQPage.jsx**
- ✅ Real MCQ generation API calls
- ✅ Error handling and loading states
- ✅ Save functionality with backend integration
- ✅ File ID parameter handling

#### **GenerateFlashcardsPage.jsx**
- ✅ Real flashcard generation API calls
- ✅ Error handling and loading states
- ✅ Save functionality with backend integration
- ✅ File ID parameter handling

#### **NotesPage.jsx, MCQsPage.jsx, FlashCardsPage.jsx**
- ✅ Real data loading from backend
- ✅ Loading states and error handling
- ✅ Delete functionality with backend integration
- ✅ Enhanced metadata display

### 4. **Error Handling Implementation**
- **Network errors**: Connection issues, timeouts
- **Server errors**: 4xx, 5xx status codes
- **Validation errors**: Input validation failures
- **Authentication errors**: Token expiration, unauthorized access
- **User-friendly messages**: Clear error communication

### 5. **Authentication Flow**
- **Login/Logout**: Full backend integration
- **Token management**: Automatic token handling
- **Route protection**: Authentication guards
- **Session persistence**: Local storage management

## 🔧 API Endpoints Integration

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
```

### File Management
```javascript
POST /api/files/upload
GET  /api/files
DELETE /api/files/:id
```

### Content Generation
```javascript
POST /api/content/generate-notes/:fileId
POST /api/content/generate-mcqs/:fileId
POST /api/content/generate-flashcards/:fileId
GET  /api/content/:id
POST /api/content/save
GET  /api/content/saved/:type
DELETE /api/content/saved/:id
```

### Session Management
```javascript
POST /api/sessions
GET  /api/sessions/current
PUT  /api/sessions/:id/progress
PUT  /api/sessions/:id/end
GET  /api/sessions/history
```

### Statistics
```javascript
GET /api/stats
GET /api/stats/analytics
```

## 🛠️ Configuration

### Environment Variables
Create a `.env` file in your project root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
NODE_ENV=development
```

### API Configuration
The API base URL is configurable through environment variables:
- Default: `http://localhost:5000/api`
- Configurable via `VITE_API_BASE_URL`

## 🔄 Data Flow

### 1. **File Upload Flow**
```
User selects file → Validation → Upload to backend → Get file ID → Navigate to generation page
```

### 2. **Content Generation Flow**
```
File ID from URL → Call generation API → Display loading → Show generated content → Save option
```

### 3. **Content Management Flow**
```
Load saved content → Display in cards → User actions (open/delete) → API calls → UI updates
```

## 🎯 Key Features Implemented

### **Error Handling**
- **Network errors**: "Network error - please check your connection"
- **Server errors**: Dynamic error messages from backend
- **Validation errors**: Field-specific error messages
- **Timeout errors**: "Request timed out - please try again"

### **Loading States**
- **File upload**: Progress bar with percentage
- **Content generation**: Spinner with descriptive text
- **Data loading**: Skeleton loaders for lists

### **User Experience**
- **File validation**: Type and size checks
- **Progress tracking**: Real-time upload progress
- **Error recovery**: Retry buttons and clear error messages
- **Responsive design**: Maintained existing design

## 🧪 Testing the Integration

### 1. **Start Backend Server**
```bash
cd memomind-backend
npm start
```

### 2. **Start Frontend Development Server**
```bash
cd memomind-frontend
npm run dev
```

### 3. **Test Scenarios**
1. **Authentication**: Login/logout functionality
2. **File Upload**: Upload PDF files and verify processing
3. **Content Generation**: Generate notes, MCQs, and flashcards
4. **Content Management**: Save, load, and delete content
5. **Error Handling**: Test with invalid inputs and network issues

## 📝 Notes for Backend Integration

### **Expected API Response Formats**

#### **File Upload Response**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123",
  "status": "processed",
    "extractedText": "..."
  }
}
```

#### **Content Generation Response**
```json
{
  "success": true,
  "data": {
    "title": "Generated Content",
    "content": "...",
    "questions": [...],
    "flashcards": [...]
  }
}
```

#### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "data": null
}
```

## 🚨 Important Considerations

### **CORS Configuration**
Ensure your backend has CORS configured for the frontend domain:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
```

### **File Upload Limits**
- Maximum file size: 10MB
- Supported formats: PDF only
- Progress tracking implemented

### **Authentication**
- JWT token-based authentication
- Automatic token refresh handling
- Route protection implemented

## 🎉 Benefits of This Integration

1. **Real Data**: No more dummy JSON files
2. **Error Handling**: Comprehensive error management
3. **User Experience**: Loading states and progress tracking
4. **Maintainability**: Centralized API management
5. **Scalability**: Easy to extend with new endpoints
6. **Security**: Proper authentication and validation

## 🔧 Troubleshooting

### **Common Issues**
1. **CORS errors**: Check backend CORS configuration
2. **Authentication errors**: Verify token handling
3. **File upload failures**: Check file size and type validation
4. **Network errors**: Verify backend server is running

### **Debug Mode**
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This integration provides a robust, production-ready connection between your frontend and backend, with comprehensive error handling and excellent user experience.

