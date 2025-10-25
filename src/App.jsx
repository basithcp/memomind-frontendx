// App.jsx
// eslint-disable-next-line no-unused-vars
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Layout from './layouts/Layout';
import FlashCardsPage from './pages/FlashCardsPage';
import GenerateFlashcardsPage from './pages/GenerateFlashcardsPage';
import GenerateMCQPage from './pages/GenerateMCQPage';
import GenerateNotesPage from './pages/GenerateNotesPage';
import HomePage from './pages/HomePage';
import LoadFlashCardsPage from './pages/LoadFlashCardsPage';
import LoadMCQPage from './pages/LoadMCQPage';
import LoadNotesPage from './pages/LoadNotesPage';
import MCQsPage from './pages/MCQsPage';
import NotesPage from './pages/NotesPage';
import UploadPage from './pages/UploadPage';

// auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

/**
 * RequireAuth - guards protected routes.
 * If not authenticated, redirects to /login.
 */
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * PublicOnly - prevents authenticated users from accessing public routes
 * like /login and /signup. If authenticated, redirect to root (/).
 */
function PublicOnly({ children }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes: rendered WITHOUT Layout (no header/sidebar) */}
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <Signup />
            </PublicOnly>
          }
        />

        {/* Protected routes: wrap each page inside Layout and RequireAuth so Layout appears only after login */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout>
                <HomePage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/upload"
          element={
            <RequireAuth>
              <Layout>
                <UploadPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/mcqs"
          element={
            <RequireAuth>
              <Layout>
                <MCQsPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/notes"
          element={
            <RequireAuth>
              <Layout>
                <NotesPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/flashcards"
          element={
            <RequireAuth>
              <Layout>
                <FlashCardsPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/generate-notes/:itemName/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <GenerateNotesPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/generate-mcq/:itemName/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <GenerateMCQPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/generate-flashcards/:itemName/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <GenerateFlashcardsPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/load-notes/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <LoadNotesPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/load-mcq/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <LoadMCQPage />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/load-flashcards/:itemId"
          element={
            <RequireAuth>
              <Layout>
                <LoadFlashCardsPage />
              </Layout>
            </RequireAuth>
          }
        />

        {/* Catch-all: if user is authenticated send to '/', otherwise send to '/login' */}
        <Route
          path="*"
          element={
            localStorage.getItem('token') ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
