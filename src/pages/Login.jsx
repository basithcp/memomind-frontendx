// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(form);
      // success -> store token + user
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user || {}));
        navigate('/'); // land on main app
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      // axios errors surfaced from services
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="auth-brand">
          {/* simple SVG logo/text - replace with your logo */}
          <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)" />
            <path d="M6 12h12M6 16h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <h2>MemoMind</h2>
          <p className="auth-tag">Learn. Remember. Repeat.</p>
        </div>

        <div className="auth-hero">
          <h3>Welcome back 👋</h3>
          <p>Sign in to continue to your study dashboard.</p>
        </div>
      </aside>

      <main className="auth-card">
        <h1 className="auth-title">Sign in</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-label">
            Username
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className="auth-input"
              placeholder="your username"
              autoComplete="username"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              className="auth-input"
              type="password"
              placeholder="your password"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="auth-link">Create one</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
