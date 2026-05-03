import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { sendOtpEmail } from '../utils/emailService';
import OTPInput from '../components/common/OTPInput';
import Modal from '../components/common/Modal';
import './Settings.css';

export default function Settings() {
  const { currentUser, updateUser } = useAuth();
  const { t, language, changeLanguage, getOtpChannel } = useLanguage();
  const toast = useToast();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  if (!currentUser) return <Navigate to="/login" />;

  const generateOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const handleLanguageChange = async (langCode) => {
    if (langCode === language) return;
    setSendingOtp(true);
    setPendingLang(langCode);

    // Generate OTP and send to email
    const otp = generateOtp();
    setGeneratedOtp(otp);

    const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;

    const result = await sendOtpEmail({
      toEmail: currentUser.email,
      toName: currentUser.displayName,
      otp: otp,
      purpose: `Language Change to ${langName}`,
    });

    setSendingOtp(false);
    setShowOtpModal(true);

    if (!result.success) {
      console.warn('Email send failed, using demo OTP mode. Error:', result.error);
    }
  };

  const handleOtpComplete = (otp) => {
    // Accept the generated OTP or demo fallback 123456
    if (otp === generatedOtp || otp === '123456') {
      changeLanguage(pendingLang);
      updateUser(currentUser.id, { language: pendingLang });
      setShowOtpModal(false);
      setPendingLang(null);
      setGeneratedOtp('');
      toast.success(t('settings.languageChanged') + ' 🌐');
    } else {
      setShowOtpModal(false);
      setPendingLang(null);
      setGeneratedOtp('');
      toast.error(t('settings.languageChangeFailed'));
    }
  };

  const handleResendOtp = async () => {
    if (!pendingLang) return;
    const otp = generateOtp();
    setGeneratedOtp(otp);
    const langName = LANGUAGES.find(l => l.code === pendingLang)?.name || pendingLang;
    await sendOtpEmail({
      toEmail: currentUser.email,
      toName: currentUser.displayName,
      otp: otp,
      purpose: `Language Change to ${langName}`,
    });
    toast.info('OTP resent to your email! 📧');
  };

  const otpMessage = `OTP has been sent to your email (${currentUser.email}) and mobile number (${currentUser.phone || 'Not set'}). Enter the code to confirm language change.`;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 className="page-title">{t('settings.title')}</h1>

        {/* Language Settings — Module 4 */}
        <div className="card settings-section" style={{ marginTop: '24px' }}>
          <h2 className="settings-section__title">🌐 {t('settings.language')}</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>
            {t('settings.languageChangeOtp')}
          </p>

          <div className="language-grid">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'language-option--active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={sendingOtp}
              >
                <span className="language-option__flag">{lang.flag}</span>
                <span className="language-option__name">{lang.name}</span>
                <span className="language-option__otp-type">
                  📧📱 Email & Mobile OTP
                </span>
                {language === lang.code && <span className="language-option__check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="card settings-section" style={{ marginTop: '16px' }}>
          <h2 className="settings-section__title">👤 Account</h2>
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="text-muted">{t('auth.email')}</span>
              <strong>{currentUser.email}</strong>
            </div>
            <div className="settings-info-item">
              <span className="text-muted">{t('auth.phone')}</span>
              <strong>{currentUser.phone || 'Not set'}</strong>
            </div>
            <div className="settings-info-item">
              <span className="text-muted">{t('auth.username')}</span>
              <strong>@{currentUser.username}</strong>
            </div>
            <div className="settings-info-item">
              <span className="text-muted">{t('profile.plan')}</span>
              <strong style={{ textTransform: 'capitalize' }}>{currentUser.plan}</strong>
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="card settings-section" style={{ marginTop: '16px' }}>
          <h2 className="settings-section__title">💡 Demo Info</h2>
          <p className="text-muted text-sm">
            Use OTP code <code style={{ background: 'var(--so-blue-light)', color: 'var(--so-blue)', padding: '2px 8px', borderRadius: '4px' }}>123456</code> for all verifications in this demo.
          </p>
        </div>
      </div>

      <Modal
        isOpen={showOtpModal}
        onClose={() => { setShowOtpModal(false); setPendingLang(null); setGeneratedOtp(''); }}
        title={t('auth.otpRequired')}
        subtitle={otpMessage}
      >
        <OTPInput onComplete={handleOtpComplete} onResend={handleResendOtp} />
        <button className="btn btn--ghost btn--full" style={{ marginTop: '12px' }} onClick={() => { setShowOtpModal(false); setPendingLang(null); setGeneratedOtp(''); }}>
          {t('common.cancel')}
        </button>
      </Modal>
    </div>
  );
}
