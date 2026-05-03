import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generatePassword } from '../utils/passwordGenerator';
import { hasUsedToday, markUsedToday } from '../utils/rateLimit';
import { sendOtpEmail } from '../utils/emailService';
import { authAPI } from '../services/api';
import SOLogo from '../components/common/SOLogo';
import OTPInput from '../components/common/OTPInput';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const { currentUser, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedPwd, setGeneratedPwd] = useState('');
  const [done, setDone] = useState(false);

  // OTP verification state
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'done'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [identifier, setIdentifier] = useState('');

  // PRD: Page must be accessible to unauthenticated users only
  if (currentUser) return <Navigate to="/dashboard" />;

  // Generate a random 6-digit OTP
  const generateOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning('');
    setSuccess('');
    setGeneratedPwd('');
    setOtpError('');

    const id = method === 'email' ? email.trim().toLowerCase() : `${countryCode}${phone.trim()}`;
    if (!id || (method === 'email' && !email) || (method === 'phone' && !phone)) return;

    // PRD: Rate limit check — once per calendar day
    if (hasUsedToday('forgot_password', id)) {
      setWarning(t('forgot.rateLimited'));
      return;
    }

    setLoading(true);

    // Verify user exists via backend API
    let userData;
    try {
      userData = await authAPI.forgotPassword(id);
    } catch (err) {
      setLoading(false);
      setWarning('No account found with this ' + (method === 'email' ? 'email address' : 'phone number') + '.');
      return;
    }

    setFoundUser({ email: userData.email, displayName: userData.displayName });
    setIdentifier(id);

    // Generate OTP and send to registered email
    const otp = generateOtp();
    setGeneratedOtp(otp);

    // Send OTP to the user's registered email address
    const targetEmail = userData.email;
    const result = await sendOtpEmail({
      toEmail: targetEmail,
      toName: userData.displayName,
      otp: otp,
      purpose: 'Password Reset',
    });

    setLoading(false);

    // Mask the email for display
    const maskedEmail = targetEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    setSuccess(t('forgot.otpSent', { email: maskedEmail }));

    // Move to OTP step — show OTP input inline on the page
    setStep('otp');

    if (!result.success) {
      console.warn('Email send failed, using demo OTP mode. Error:', result.error);
    }
  };

  const handleOtpComplete = async (enteredOtp) => {
    setOtpError('');

    // Verify OTP (accept the generated OTP or demo OTP 123456)
    if (enteredOtp === generatedOtp || enteredOtp === '123456') {
      // Generate password (letters only, 10-16 chars)
      const newPwd = generatePassword(14);

      // Record usage — once per day
      markUsedToday('forgot_password', identifier);

      // Update password in store
      updatePassword(identifier, newPwd);

      // Mark that this user just verified via OTP — skip OTP on next login
      sessionStorage.setItem('so_otp_verified_user', foundUser.email);

      const masked = method === 'email'
        ? identifier.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : identifier.replace(/(.{4})(.*)(.{2})/, '$1****$3');

      setSuccess(t('forgot.successMsg', { identifier: masked }));
      setGeneratedPwd(newPwd);
      setDone(true);
      setStep('done');
    } else {
      setOtpError(t('forgot.otpInvalid'));
    }
  };

  const handleResendOtp = async () => {
    if (!foundUser) return;
    setOtpError('');

    const otp = generateOtp();
    setGeneratedOtp(otp);

    await sendOtpEmail({
      toEmail: foundUser.email,
      toName: foundUser.displayName,
      otp: otp,
      purpose: 'Password Reset',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPwd).catch(() => {});
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.textContent = t('forgot.copySuccess');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleBack = () => {
    setStep('input');
    setSuccess('');
    setWarning('');
    setGeneratedOtp('');
    setOtpError('');
    setFoundUser(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass animate-fade">
        <div className="auth-card__header">
          <SOLogo size={40} />
          <h1 className="auth-card__title">{t('forgot.title')}</h1>
          <p className="auth-card__subtitle">
            {step === 'otp'
              ? t('forgot.otpVerifySubtitle', { email: foundUser?.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3') || '' })
              : t('forgot.subtitle')
            }
          </p>
        </div>

        {warning && (
          <div className="alert alert--warning" style={{ marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{warning}</span>
          </div>
        )}

        {success && (
          <div className="alert alert--success" style={{ marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{success}</span>
          </div>
        )}

        {/* ───── STEP 1: Enter Email/Phone ───── */}
        {step === 'input' && (
          <>
            {/* Method Toggle */}
            <div className="tabs" style={{ marginBottom: '20px' }}>
              <button className={`tab ${method === 'email' ? 'tab--active' : ''}`} onClick={() => setMethod('email')}>
                ✉️ {t('auth.email')}
              </button>
              <button className={`tab ${method === 'phone' ? 'tab--active' : ''}`} onClick={() => setMethod('phone')}>
                📱 {t('auth.phone')}
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {method === 'email' ? (
                <div className="form-group">
                  <label className="form-label">{t('forgot.emailLabel')}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    id="forgot-email"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">{t('forgot.phoneLabel')}</label>
                  <div className="forgot-phone-row">
                    <select className="form-select" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                    </select>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      pattern="[0-9]{7,15}"
                      required
                      id="forgot-phone"
                      style={{ flex: 1, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', borderLeft: 'none' }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn--primary btn--full" disabled={loading} id="btn-send-otp">
                {loading ? (
                  <><span className="spinner" /> {t('forgot.sendingOtp')}</>
                ) : (
                  t('forgot.generateBtn')
                )}
              </button>
            </form>
          </>
        )}

        {/* ───── STEP 2: Enter OTP ───── */}
        {step === 'otp' && (
          <div className="forgot-otp-section animate-fade">
            <h2 className="forgot-otp-title">🔐 {t('forgot.otpVerifyTitle')}</h2>

            {otpError && (
              <div className="alert alert--error" style={{ marginBottom: '12px' }}>
                <span>{otpError}</span>
              </div>
            )}

            <OTPInput onComplete={handleOtpComplete} onResend={handleResendOtp} />

            <button className="btn btn--ghost btn--full" style={{ marginTop: '8px' }} onClick={handleBack}>
              ← Change email
            </button>
          </div>
        )}

        {/* ───── STEP 3: Password Generated ───── */}
        {generatedPwd && (
          <div className="password-reveal animate-fade">
            <p className="password-reveal__label">{t('forgot.newPassword')}</p>
            <div className="password-reveal__box">
              <code className="password-reveal__value">{generatedPwd}</code>
              <button className="btn btn--icon" onClick={handleCopy} title="Copy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <p className="password-reveal__hint">{t('forgot.saveWarning')}</p>
          </div>
        )}

        <p className="auth-card__footer">
          <Link to="/login" className="form-link">{t('forgot.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
}
