// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import '../styles/auth.css';

const ERROR_KEY = 'loginError';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  // initialize from sessionStorage to make error persistent across remounts
  const [error, setErrorState] = useState(() => sessionStorage.getItem(ERROR_KEY) || '');

  // helper to keep state + sessionStorage in sync
  const setPersistentError = (msg) => {
    setErrorState(msg);
    if (msg) sessionStorage.setItem(ERROR_KEY, msg);
    else sessionStorage.removeItem(ERROR_KEY);
  };

  // if you want to clear persisted error when this route unmounts, uncomment:
  // useEffect(() => () => sessionStorage.removeItem(ERROR_KEY), []);

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // do NOT clear the error here — keep it visible until explicit user action
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setPersistentError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(form);
      // success -> store token + user
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user || {}));
        // remove persisted error on successful login
        setPersistentError('');
        navigate('/'); // land on main app
      } else {
        setPersistentError('Unexpected response from server.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      setPersistentError(msg);
    } finally {
      setLoading(false);
    }
  };

  // explicit focus handler to let user clear the error when they start fixing input
  const handleFocus = () => setPersistentError('');

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="auth-brand">
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
              onFocus={handleFocus}
              data-testid="username-input"
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
              onFocus={handleFocus}
              data-testid="password-input"
              className="auth-input"
              type="password"
              placeholder="your password"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div
              className="auth-error"
              role="alert"
              aria-live="polite"
              data-testid="auth-error"
            >
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            data-testid="signin-button"
          >
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
