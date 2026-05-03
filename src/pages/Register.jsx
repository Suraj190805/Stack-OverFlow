import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import SOLogo from '../components/common/SOLogo';
import './Register.css';
import './Login.css';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least 1 letter and 1 number.');
      return;
    }

    // Generate display name and username from email
    const emailName = email.split('@')[0];
    const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    const username = emailName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const result = await register({
      displayName,
      username,
      email,
      phone: '',
      password,
    });

    if (result.success) {
      toast.success('Account created! Welcome to Stack Overflow! 🎉');
      navigate('/home');
    } else {
      setError(result.error);
    }
  };

  const handleSocialSignup = (provider) => {
    toast.info(`${provider} signup is for demonstration — use email signup below.`);
  };

  return (
    <div className="auth-page">
      {/* Sign Up Card — matches official SO popup */}
      <div className="signup-card">
        {/* Close button (visual only) */}
        <Link to="/login" className="signup-card__close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>

        {/* Header */}
        <div className="signup-card__header">
          <div className="signup-card__logo">
            <SOLogo size={32} />
          </div>
          <h1 className="signup-card__title">Join Stack Overflow</h1>
          <p className="signup-card__terms">
            By clicking "Sign up", you agree to our{' '}
            <a href="#">terms of service</a> and acknowledge you have read our{' '}
            <a href="#">privacy policy</a>.
          </p>
        </div>

        {/* Social Buttons — outlined style like SO */}
        <div className="signup-social-buttons">
          <button
            type="button"
            className="signup-social-btn"
            onClick={() => handleSocialSignup('Google')}
            id="btn-google-signup"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <button
            type="button"
            className="signup-social-btn"
            onClick={() => handleSocialSignup('GitHub')}
            id="btn-github-signup"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="#24292e">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Sign up with GitHub
          </button>
        </div>

        {/* OR Divider */}
        <div className="signup-divider">
          <span>OR</span>
        </div>

        {/* Form */}
        {error && (
          <div className="signup-error">{error}</div>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-password">Password</label>
            <div className="signup-password-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="signup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters (at least 1 letter & 1 number)"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-submit-btn" id="btn-register-submit">
            Sign up
          </button>
        </form>

        {/* Footer */}
        <p className="signup-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
