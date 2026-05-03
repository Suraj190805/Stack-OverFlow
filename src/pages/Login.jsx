import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { isLoginWindowOpen } from '../utils/timeRestrictions';
import SOLogo from '../components/common/SOLogo';
import OTPInput from '../components/common/OTPInput';
import Modal from '../components/common/Modal';
import './Login.css';

const DEMO_ACCOUNTS = [
  { name: 'John Developer', email: 'john@example.com', plan: 'free', badge: 'Free' },
  { name: 'Jane Coder', email: 'jane@example.com', plan: 'silver', badge: 'Silver' },
  { name: 'Alex Programmer', email: 'alex@example.com', plan: 'gold', badge: 'Gold' },
];

export default function Login() {
  const { login, completeOtpLogin } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otpUser, setOtpUser] = useState(null);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } else if (result.requiresOtp) {
      setOtpUser(result.user);
      setOtpMessage(result.message);
      setOtpError('');
      setShowOtp(true);
    } else {
      setError(result.error);
    }
  };

  const handleOtpComplete = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    const result = await completeOtpLogin(otpUser, otp);
    setOtpLoading(false);
    if (result.success) {
      toast.success('Verified! Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      setOtpError(result.error || 'Invalid OTP. Please try again.');
    }
  };

  const handleDemoLogin = (account) => {
    setEmail(account.email);
    setPassword('password');
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login is for demonstration — use email login below.`);
  };

  return (
    <div className="auth-page">
      {/* SO Logo */}
      <div className="auth-logo">
        <SOLogo size={48} />
      </div>

      {/* Social Buttons */}
      <div className="auth-social-buttons">
        <button
          type="button"
          className="auth-social-btn auth-social-btn--google"
          onClick={() => handleSocialLogin('Google')}
          id="btn-google-login"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Log in with Google
        </button>

        <button
          type="button"
          className="auth-social-btn auth-social-btn--github"
          onClick={() => handleSocialLogin('GitHub')}
          id="btn-github-login"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#fff">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Log in with GitHub
        </button>

        <button
          type="button"
          className="auth-social-btn auth-social-btn--facebook"
          onClick={() => handleSocialLogin('Facebook')}
          id="btn-facebook-login"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff">
            <path d="M17 1H1v16h8.8v-6.2H7.6V8.3h2.2V6.6c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2.1h-1c-1 0-1.3.6-1.3 1.3v1.6h2.3l-.4 2.5h-1.9V17H17V1z"/>
          </svg>
          Log in with Facebook
        </button>
      </div>

      {/* OR Divider */}
      <div className="auth-divider">
        <div className="auth-divider__line" />
        <span className="auth-divider__text">or</span>
        <div className="auth-divider__line" />
      </div>

      {/* Login Time Window Alert */}
      {!isLoginWindowOpen() && (
        <div className="alert alert--warning" style={{ maxWidth: '316px', margin: '0 auto 16px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ fontSize: '18px' }}>⏰</span>
          <div>
            <strong>Login Window Closed</strong>
            <p style={{ margin: '2px 0 0', fontSize: '12px' }}>
              Login is only available between 10:00 AM and 1:00 PM IST. Please try again during this window.
            </p>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="auth-card-so">
        {error && (
          <div className="alert alert--error" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">{t('auth.email')}</label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="login-password" className="form-label">{t('auth.password')}</label>
              <Link to="/forgot-password" className="form-link">{t('auth.forgotPassword')}</Link>
            </div>
            <input
              type="password"
              id="login-password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading} id="btn-login-submit">
            {loading ? <span className="spinner" /> : t('auth.loginButton')}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="auth-footer-text">
        {t('auth.dontHaveAccount')} <Link to="/register">{t('nav.signup')}</Link>
      </p>

      {/* Demo Hints */}
      <div className="login-demo-box">
        <div className="login-demo-box__title">
          <span>💡</span> Demo Accounts
        </div>
        <div className="login-demo-box__accounts">
          {DEMO_ACCOUNTS.map(account => (
            <div
              key={account.email}
              className="login-demo-account"
              onClick={() => handleDemoLogin(account)}
              role="button"
              tabIndex={0}
            >
              <div className="login-demo-account__info">
                <span className="login-demo-account__name">{account.name}</span>
                <span className="login-demo-account__email">{account.email}</span>
              </div>
              <span className={`login-demo-account__badge login-demo-account__badge--${account.plan}`}>
                {account.badge}
              </span>
            </div>
          ))}
        </div>
        <div className="login-demo-password">
          Password: <code>password</code>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal isOpen={showOtp} onClose={() => setShowOtp(false)} title={t('auth.otpRequired')} subtitle={otpMessage}>
        <OTPInput onComplete={handleOtpComplete} error={otpError} loading={otpLoading} />
        <button className="btn btn--ghost btn--full" style={{ marginTop: '12px' }} onClick={() => setShowOtp(false)}>
          {t('common.cancel')}
        </button>
      </Modal>
    </div>
  );
}
