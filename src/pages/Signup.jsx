// src/pages/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/authService';
import '../styles/auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.fullName || !form.password || !form.confirmPassword) {
      setError('Please complete all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(form);
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user || {}));
        navigate('/');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Signup failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="auth-brand">
          <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)" />
            <path d="M6 12h12M6 16h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <h2>MemoMind</h2>
          <p className="auth-tag">Create your account</p>
        </div>

        <div className="auth-hero">
          <h3>Join MemoMind 🎓</h3>
          <p>Create an account to save your notes and flashcards.</p>
        </div>
      </aside>

      <main className="auth-card">
        <h1 className="auth-title">Sign up</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-label">
            Username
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className="auth-input"
              placeholder="choose a unique id"
              autoComplete="username"
            />
          </label>

          <label className="auth-label">
            Full name
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              className="auth-input"
              placeholder="Your full name"
              autoComplete="name"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="auth-input"
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
          </label>

          <label className="auth-label">
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              className="auth-input"
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
