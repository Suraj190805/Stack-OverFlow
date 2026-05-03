import React, { useState, useEffect, useRef } from 'react';
import { isPaymentWindowOpen, getPaymentWindowMessage } from '../../utils/timeRestrictions';
import './RazorpayCheckout.css';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
];

const BANKS = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
  { id: 'pnb', name: 'Punjab National Bank' },
];

const WALLETS = [
  { id: 'paytm', name: 'Paytm' },
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'amazon', name: 'Amazon Pay' },
  { id: 'freecharge', name: 'Freecharge' },
];

const STAGES = {
  FORM: 'form',
  PROCESSING: 'processing',
  OTP: 'otp',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export default function RazorpayCheckout({ plan, user, onSuccess, onCancel }) {
  const [method, setMethod] = useState('card');
  const [stage, setStage] = useState(STAGES.FORM);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI
  const [upiId, setUpiId] = useState('');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('');

  // Check payment window
  const paymentOpen = isPaymentWindowOpen();

  // OTP countdown timer
  useEffect(() => {
    if (stage === STAGES.OTP && otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [stage, otpTimer]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (stage === STAGES.OTP && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [stage]);

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    if (!paymentOpen) {
      setError(getPaymentWindowMessage());
      return false;
    }

    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return false;
      }
      if (cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return false;
      }
      if (cardCvv.length < 3) {
        setError('Please enter a valid CVV.');
        return false;
      }
      if (!cardName.trim()) {
        setError('Please enter the cardholder name.');
        return false;
      }
    } else if (method === 'upi') {
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@upi).');
        return false;
      }
    } else if (method === 'netbanking') {
      if (!selectedBank) {
        setError('Please select a bank.');
        return false;
      }
    } else if (method === 'wallet') {
      if (!selectedWallet) {
        setError('Please select a wallet.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handlePay = async () => {
    if (!validateForm()) return;

    // Stage 1: Processing
    setStage(STAGES.PROCESSING);
    await new Promise(r => setTimeout(r, 1800));

    // Stage 2: OTP verification
    setStage(STAGES.OTP);
    setOtpTimer(30);
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    // Re-check payment window at verification time
    if (!isPaymentWindowOpen()) {
      setError('Payment window has closed (10:00 AM – 11:00 AM IST). Transaction cancelled.');
      setStage(STAGES.FAILED);
      return;
    }

    setError('');
    setStage(STAGES.PROCESSING);
    await new Promise(r => setTimeout(r, 1500));

    // Simulate success (always succeeds for demo)
    setStage(STAGES.SUCCESS);

    // Generate transaction ID
    const txnId = `rzp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const paymentData = {
      txnId,
      method: method,
      methodLabel: PAYMENT_METHODS.find(m => m.id === method)?.label,
      amount: plan.price,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      onSuccess(paymentData);
    }, 2000);
  };

  const renderForm = () => {
    switch (method) {
      case 'card':
        return (
          <div className="rzp-form">
            <div className="rzp-field">
              <label className="rzp-field__label">Card Number</label>
              <input
                className="rzp-field__input"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="rzp-field-row">
              <div className="rzp-field">
                <label className="rzp-field__label">Expiry</label>
                <input
                  className="rzp-field__input"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="rzp-field">
                <label className="rzp-field__label">CVV</label>
                <input
                  className="rzp-field__input"
                  type="password"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="rzp-field">
              <label className="rzp-field__label">Cardholder Name</label>
              <input
                className="rzp-field__input"
                placeholder="Name on card"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
              />
            </div>
          </div>
        );

      case 'upi':
        return (
          <div className="rzp-form">
            <div className="rzp-field">
              <label className="rzp-field__label">UPI ID</label>
              <input
                className="rzp-field__input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
            </div>
            <div className="rzp-upi-apps">
              <span className="rzp-upi-apps__label">Or pay using</span>
              <div className="rzp-upi-icons">
                <button className="rzp-upi-icon" onClick={() => setUpiId('user@gpay')}>G Pay</button>
                <button className="rzp-upi-icon" onClick={() => setUpiId('user@phonepe')}>PhonePe</button>
                <button className="rzp-upi-icon" onClick={() => setUpiId('user@paytm')}>Paytm</button>
              </div>
            </div>
          </div>
        );

      case 'netbanking':
        return (
          <div className="rzp-form">
            <div className="rzp-bank-list">
              {BANKS.map(bank => (
                <label
                  key={bank.id}
                  className={`rzp-bank-option ${selectedBank === bank.id ? 'rzp-bank-option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="bank"
                    value={bank.id}
                    checked={selectedBank === bank.id}
                    onChange={() => setSelectedBank(bank.id)}
                  />
                  <span className="rzp-bank-option__name">{bank.name}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="rzp-form">
            <div className="rzp-bank-list">
              {WALLETS.map(wallet => (
                <label
                  key={wallet.id}
                  className={`rzp-bank-option ${selectedWallet === wallet.id ? 'rzp-bank-option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="wallet"
                    value={wallet.id}
                    checked={selectedWallet === wallet.id}
                    onChange={() => setSelectedWallet(wallet.id)}
                  />
                  <span className="rzp-bank-option__name">{wallet.name}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderProcessing = () => (
    <div className="rzp-processing">
      <div className="rzp-processing__spinner">
        <div className="rzp-spinner-ring" />
      </div>
      <p className="rzp-processing__text">Processing payment...</p>
      <p className="rzp-processing__sub">Please do not close this window</p>
    </div>
  );

  const renderOtp = () => (
    <div className="rzp-otp-stage">
      <div className="rzp-otp-icon">🔐</div>
      <h3 className="rzp-otp-title">Verify Payment</h3>
      <p className="rzp-otp-desc">
        Enter the 6-digit OTP sent to<br />
        <strong>{user.phone || user.email}</strong>
      </p>
      <div className="rzp-otp-inputs">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => (otpRefs.current[i] = el)}
            className="rzp-otp-input"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
          />
        ))}
      </div>
      {error && <p className="rzp-error">{error}</p>}
      <button className="rzp-btn rzp-btn--verify" onClick={handleVerifyOtp}>
        Verify & Pay ₹{plan.price}
      </button>
      <p className="rzp-otp-timer">
        {otpTimer > 0 ? (
          <>Resend OTP in <strong>{otpTimer}s</strong></>
        ) : (
          <button className="rzp-link" onClick={() => { setOtpTimer(30); setOtp(['', '', '', '', '', '']); }}>
            Resend OTP
          </button>
        )}
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="rzp-success-stage">
      <div className="rzp-success-checkmark">
        <svg viewBox="0 0 52 52" className="rzp-checkmark-svg">
          <circle className="rzp-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="rzp-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
      <h3 className="rzp-success-title">Payment Successful!</h3>
      <p className="rzp-success-amount">₹{plan.price}</p>
      <p className="rzp-success-desc">Your {plan.name} plan is now active</p>
    </div>
  );

  const renderFailed = () => (
    <div className="rzp-failed-stage">
      <div className="rzp-failed-icon">✕</div>
      <h3 className="rzp-failed-title">Payment Failed</h3>
      <p className="rzp-failed-desc">{error || 'Transaction could not be completed.'}</p>
      <button className="rzp-btn rzp-btn--retry" onClick={() => { setStage(STAGES.FORM); setError(''); }}>
        Try Again
      </button>
      <button className="rzp-link" onClick={onCancel}>Cancel</button>
    </div>
  );

  return (
    <div className="rzp-overlay" onClick={stage === STAGES.FORM ? onCancel : undefined}>
      <div className="rzp-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="rzp-header">
          <div className="rzp-header__brand">
            <div className="rzp-header__logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#528FF0" />
                <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="rzp-header__name">Razorpay</span>
          </div>
          {stage === STAGES.FORM && (
            <button className="rzp-header__close" onClick={onCancel}>✕</button>
          )}
        </div>

        {/* Order Summary */}
        <div className="rzp-order">
          <div className="rzp-order__plan">
            <span className="rzp-order__plan-icon">{plan.icon}</span>
            <div>
              <div className="rzp-order__plan-name">{plan.name} Plan</div>
              <div className="rzp-order__plan-desc">
                {plan.questionsPerDay === Infinity ? 'Unlimited' : plan.questionsPerDay} questions/day • Monthly
              </div>
            </div>
          </div>
          <div className="rzp-order__amount">₹{plan.price}</div>
        </div>

        {/* Body */}
        <div className="rzp-body">
          {stage === STAGES.FORM && (
            <>
              {/* Payment method tabs */}
              <div className="rzp-methods">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`rzp-method-tab ${method === m.id ? 'rzp-method-tab--active' : ''}`}
                    onClick={() => { setMethod(m.id); setError(''); }}
                  >
                    <span className="rzp-method-tab__icon">{m.icon}</span>
                    <span className="rzp-method-tab__label">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Form */}
              {renderForm()}

              {/* Error */}
              {error && <p className="rzp-error">{error}</p>}

              {/* Pay Button */}
              <button
                className="rzp-btn rzp-btn--pay"
                onClick={handlePay}
                disabled={!paymentOpen}
              >
                {paymentOpen
                  ? `Pay ₹${plan.price}`
                  : '🔒 Payment Window Closed'}
              </button>

              {!paymentOpen && (
                <p className="rzp-time-notice">
                  ⏰ Payments accepted only between 10:00 AM – 11:00 AM IST
                </p>
              )}
            </>
          )}

          {stage === STAGES.PROCESSING && renderProcessing()}
          {stage === STAGES.OTP && renderOtp()}
          {stage === STAGES.SUCCESS && renderSuccess()}
          {stage === STAGES.FAILED && renderFailed()}
        </div>

        {/* Footer */}
        <div className="rzp-footer">
          <span className="rzp-footer__lock">🔒</span>
          <span className="rzp-footer__text">Secured by <strong>Razorpay</strong></span>
        </div>
      </div>
    </div>
  );
}
