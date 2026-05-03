import React, { useState, useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, onComplete, onResend, error: externalError, loading: externalLoading }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [verifying, setVerifying] = useState(false);
  const refs = useRef([]);

  const isFilled = otp.every(d => d !== '');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Reset verifying state when external error comes in
  useEffect(() => {
    if (externalError) {
      setVerifying(false);
    }
  }, [externalError]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    // Allow submitting with Enter when all digits filled
    if (e.key === 'Enter' && isFilled) {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return;
    const digits = pasteData.slice(0, length).split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    // Focus the next empty slot or last slot
    const nextEmpty = newOtp.findIndex(d => d === '');
    refs.current[nextEmpty >= 0 ? nextEmpty : length - 1]?.focus();
  };

  const handleVerify = async () => {
    if (!isFilled || verifying) return;
    setVerifying(true);
    await onComplete(otp.join(''));
    setVerifying(false);
  };

  const handleResend = () => {
    setTimer(300);
    setOtp(Array(length).fill(''));
    refs.current[0]?.focus();
    onResend?.();
  };

  const handleClear = () => {
    setOtp(Array(length).fill(''));
    refs.current[0]?.focus();
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const isLoading = verifying || externalLoading;

  return (
    <div className="otp-wrapper">
      <div className="otp-inputs" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="form-input"
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '1.3rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              borderColor: externalError ? 'var(--error)' : undefined,
            }}
          />
        ))}
      </div>

      {externalError && (
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: 'var(--error)', fontWeight: 500 }}>
          {externalError}
          <button
            type="button"
            onClick={handleClear}
            style={{ marginLeft: '8px', color: 'var(--text-link)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}
          >
            Clear & retry
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        {timer > 0 ? (
          <span>OTP expires in <strong style={{ color: timer < 60 ? 'var(--error)' : 'var(--text-link)' }}>{minutes}:{String(seconds).padStart(2, '0')}</strong></span>
        ) : (
          <span style={{ color: 'var(--error)' }}>OTP has expired</span>
        )}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        className="btn btn--primary btn--full"
        style={{ marginTop: '16px' }}
        disabled={!isFilled || isLoading || timer <= 0}
      >
        {isLoading ? <span className="spinner" /> : 'Verify OTP'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        className="btn btn--ghost btn--full"
        style={{ marginTop: '8px' }}
        disabled={timer > 270}
      >
        Resend OTP {timer > 270 ? `(${270 - (300 - timer)}s)` : ''}
      </button>

      {/* Demo hint: check console for the actual OTP */}
      <div style={{ textAlign: 'center', marginTop: '12px', padding: '8px', background: 'var(--info-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--info)' }}>
        💡 Demo: Check your email or browser console for the OTP
      </div>
    </div>
  );
}
