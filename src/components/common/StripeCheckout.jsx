import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripe, STRIPE_ELEMENT_STYLE } from '../../config/stripe';
import { isPaymentWindowOpen, getPaymentWindowMessage } from '../../utils/timeRestrictions';
import './StripeCheckout.css';

/* ─── Stage machine ─── */
const STAGES = {
  FORM: 'form',
  PROCESSING: 'processing',
  AUTH: 'auth',
  SUCCESS: 'success',
  FAILED: 'failed',
};

/* ══════════════════════════════════════════════════════════
   Inner form — must be rendered inside <Elements> provider
   ══════════════════════════════════════════════════════════ */
function CheckoutForm({ plan, user, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [stage, setStage] = useState(STAGES.FORM);
  const [error, setError] = useState('');
  const [cardBrand, setCardBrand] = useState(null);
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState(user.email || '');
  const [cardName, setCardName] = useState(user.displayName || '');
  const [saveCard, setSaveCard] = useState(true);

  // 3D Secure auth
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  const [authTimer, setAuthTimer] = useState(30);
  const authRefs = useRef([]);

  const paymentOpen = isPaymentWindowOpen();

  // ── Card brand detection (real-time from Stripe) ──
  const handleCardChange = useCallback((event) => {
    setCardComplete(prev => ({ ...prev, number: event.complete }));
    if (event.brand && event.brand !== 'unknown') {
      setCardBrand(getBrandInfo(event.brand));
    } else {
      setCardBrand(null);
    }
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  }, []);

  const handleExpiryChange = useCallback((event) => {
    setCardComplete(prev => ({ ...prev, expiry: event.complete }));
    if (event.error) setError(event.error.message);
    else if (error && error.includes('expir')) setError('');
  }, [error]);

  const handleCvcChange = useCallback((event) => {
    setCardComplete(prev => ({ ...prev, cvc: event.complete }));
    if (event.error) setError(event.error.message);
    else if (error && error.includes('security')) setError('');
  }, [error]);

  // ── Auth timer countdown ──
  useEffect(() => {
    if (stage === STAGES.AUTH && authTimer > 0) {
      const t = setTimeout(() => setAuthTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [stage, authTimer]);

  useEffect(() => {
    if (stage === STAGES.AUTH && authRefs.current[0]) {
      authRefs.current[0].focus();
    }
  }, [stage]);

  // ── Brand info helper ──
  function getBrandInfo(brand) {
    const brands = {
      visa:       { name: 'Visa',       color: '#1a1f71', icon: 'VISA' },
      mastercard: { name: 'Mastercard', color: '#eb001b', icon: 'MC' },
      amex:       { name: 'Amex',       color: '#006fcf', icon: 'AMEX' },
      discover:   { name: 'Discover',   color: '#ff6000', icon: 'DISC' },
      diners:     { name: 'Diners',     color: '#0079be', icon: 'DIN' },
      jcb:        { name: 'JCB',        color: '#1f72cd', icon: 'JCB' },
      unionpay:   { name: 'UnionPay',   color: '#e21836', icon: 'UP' },
    };
    return brands[brand] || null;
  }

  // ── Auth OTP handlers ──
  const handleAuthChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...authCode];
    newCode[index] = value.slice(-1);
    setAuthCode(newCode);
    if (value && index < 5) {
      authRefs.current[index + 1]?.focus();
    }
  };

  const handleAuthKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !authCode[index] && index > 0) {
      authRefs.current[index - 1]?.focus();
    }
  };

  // ── Validate & pay ──
  const handlePay = async () => {
    if (!paymentOpen) {
      setError(getPaymentWindowMessage());
      return;
    }
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cardName.trim()) {
      setError('Please enter the name on the card.');
      return;
    }
    if (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc) {
      setError('Please complete all card fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // ── Create PaymentMethod via Stripe.js ──
      // IMPORTANT: Capture the PaymentMethod BEFORE changing stage,
      // because setStage(PROCESSING) would unmount the card elements
      // and Stripe can't read card data from destroyed iframes.
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        setError('Card fields are not ready. Please wait a moment and try again.');
        setSubmitting(false);
        return;
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: cardName,
          email: email,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setSubmitting(false);
        return;
      }

      // PaymentMethod captured successfully — now safe to switch to processing view
      setStage(STAGES.PROCESSING);
      setSubmitting(false);

      // In production, you'd send paymentMethod.id + plan.stripePriceId
      // to your backend to create a Subscription via Stripe API.
      // For this demo, we proceed to 3D Secure simulation.
      console.log('✅ Stripe PaymentMethod created:', paymentMethod.id);
      console.log('   Stripe Price ID:', plan.stripePriceId);
      console.log('   Card brand:', paymentMethod.card.brand);
      console.log('   Last 4:', paymentMethod.card.last4);

      // Simulate server-side processing delay
      await new Promise(r => setTimeout(r, 1200));

      // Direct success — skip 3D Secure auth
      completePayment(paymentMethod);
    } catch (err) {
      console.error('Stripe error:', err);
      setSubmitting(false);
      // Provide user-friendly error messages for common Stripe issues
      let userMessage = 'Payment processing failed. Please try again.';
      if (err.message?.includes('Element') || err.message?.includes('element')) {
        userMessage = 'Card fields are not ready. Please wait a moment and try again.';
      } else if (err.message?.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        userMessage = err.message;
      }
      setError(userMessage);
      setStage(STAGES.FORM);
    }
  };

  // ── Complete payment after auth ──
  const completePayment = (paymentMethod) => {
    setStage(STAGES.SUCCESS);

    const brand = getBrandInfo(paymentMethod.card.brand);
    const txnId = `pi_${paymentMethod.id.slice(3)}`;

    const paymentData = {
      txnId,
      stripePaymentMethodId: paymentMethod.id,
      stripePriceId: plan.stripePriceId,
      method: 'card',
      methodLabel: `${brand?.name || 'Card'} •••• ${paymentMethod.card.last4}`,
      cardBrand: paymentMethod.card.brand,
      cardLast4: paymentMethod.card.last4,
      cardExpMonth: paymentMethod.card.exp_month,
      cardExpYear: paymentMethod.card.exp_year,
      amount: plan.price,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => onSuccess(paymentData), 2200);
  };

  // ── Verify 3D Secure auth ──
  const handleVerifyAuth = async () => {
    const code = authCode.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    if (!isPaymentWindowOpen()) {
      setError('Payment window has closed (10:00 AM – 11:00 AM IST). Transaction cancelled.');
      setStage(STAGES.FAILED);
      return;
    }

    setError('');
    setStage(STAGES.PROCESSING);
    await new Promise(r => setTimeout(r, 1500));

    // Get the PaymentMethod we already created
    const cardNumberElement = elements.getElement(CardNumberElement);
    const { paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
      billing_details: { name: cardName, email },
    });

    if (paymentMethod) {
      completePayment(paymentMethod);
    } else {
      setStage(STAGES.FAILED);
      setError('Authentication failed. Please try again.');
    }
  };

  // ── Computed values ──
  const gstAmount = Math.round(plan.price * 0.18);
  const totalAmount = plan.price + gstAmount;

  // ── Stripe Element options ──
  const elementOptions = {
    style: STRIPE_ELEMENT_STYLE,
    classes: {
      base: 'stripe-element',
      focus: 'stripe-element--focus',
      invalid: 'stripe-element--invalid',
      complete: 'stripe-element--complete',
    },
  };

  return (
    <div className="stripe-overlay" onClick={stage === STAGES.FORM ? onCancel : undefined}>
      <div className="stripe-modal" onClick={e => e.stopPropagation()}>

        {/* ─── Left: Order Summary ─── */}
        <div className="stripe-summary">
          <div className="stripe-summary__header">
            <div className="stripe-brand">
              <div className="stripe-brand__logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" fill="#F48225"/>
                  <path d="M8 11h8M8 15h5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="stripe-brand__name">StackOverflow</span>
            </div>
          </div>

          <div className="stripe-summary__plan">
            <div className="stripe-plan-icon">{plan.icon}</div>
            <div className="stripe-plan-info">
              <div className="stripe-plan-name">{plan.name} Plan</div>
              <div className="stripe-plan-desc">
                {plan.questionsPerDay === Infinity ? 'Unlimited' : plan.questionsPerDay} questions/day
              </div>
            </div>
          </div>

          <div className="stripe-summary__lines">
            <div className="stripe-line">
              <span>Subscription (Monthly)</span>
              <span>₹{plan.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="stripe-line">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="stripe-line stripe-line--total">
              <span>Total due today</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="stripe-recurring">
            <span className="stripe-recurring__icon">🔄</span>
            <span>Then ₹{totalAmount.toLocaleString('en-IN')}/month starting {new Date(Date.now() + 30*86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="stripe-powered">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.076c0 3.865 2.36 5.537 6.196 6.974 2.446.916 3.282 1.577 3.282 2.601 0 .932-.77 1.473-2.163 1.473-1.857 0-4.727-.925-6.657-2.066l-.941 5.57C5.093 22.782 7.895 24 11.388 24c2.595 0 4.735-.64 6.233-1.857 1.638-1.322 2.479-3.225 2.479-5.652 0-3.963-2.394-5.58-6.124-7.341z" fill="#6772e5"/></svg>
            <span>Powered by <strong>Stripe</strong></span>
          </div>
        </div>

        {/* ─── Right: Payment Form ─── */}
        <div className="stripe-form-panel">

          {/* ════ FORM STAGE ════ */}
          {stage === STAGES.FORM && (
            <>
              <button className="stripe-close" onClick={onCancel}>✕</button>

              <h2 className="stripe-form-title">Pay with card</h2>

              {/* Stripe connection indicator */}
              <div className="stripe-connected-badge">
                <span className="stripe-connected-dot" />
                Connected to Stripe
              </div>

              {/* Email */}
              <div className="stripe-field">
                <label className="stripe-label">Email</label>
                <input
                  className="stripe-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {/* Card information — Real Stripe Elements */}
              <div className="stripe-field">
                <label className="stripe-label">Card information</label>
                <div className="stripe-card-group">
                  <div className="stripe-card-number-row">
                    <div className="stripe-element-wrapper stripe-element-wrapper--num">
                      <CardNumberElement
                        options={{
                          ...elementOptions,
                          showIcon: true,
                          placeholder: '1234 1234 1234 1234',
                        }}
                        onChange={handleCardChange}
                      />
                    </div>
                    {cardBrand && (
                      <span className="stripe-card-brand-badge" style={{ background: cardBrand.color }}>
                        {cardBrand.icon}
                      </span>
                    )}
                    <div className="stripe-card-icons">
                      <span className="stripe-card-icon stripe-card-icon--visa">VISA</span>
                      <span className="stripe-card-icon stripe-card-icon--mc">MC</span>
                      <span className="stripe-card-icon stripe-card-icon--amex">AMEX</span>
                    </div>
                  </div>
                  <div className="stripe-card-bottom-row">
                    <div className="stripe-element-wrapper stripe-element-wrapper--expiry">
                      <CardExpiryElement
                        options={{
                          ...elementOptions,
                          placeholder: 'MM / YY',
                        }}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div className="stripe-element-wrapper stripe-element-wrapper--cvc">
                      <CardCvcElement
                        options={{
                          ...elementOptions,
                          placeholder: 'CVC',
                        }}
                        onChange={handleCvcChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Name on card */}
              <div className="stripe-field">
                <label className="stripe-label">Name on card</label>
                <input
                  className="stripe-input"
                  placeholder="Full name on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>

              {/* Save card */}
              <label className="stripe-save-card">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={e => setSaveCard(e.target.checked)}
                />
                <span>Save this card for future payments</span>
              </label>

              {/* Error display */}
              {error && <div className="stripe-error">{error}</div>}

              {/* Pay button */}
              <button
                className="stripe-pay-btn"
                onClick={handlePay}
                disabled={!paymentOpen || !stripe || submitting}
              >
                {submitting
                  ? '⏳ Processing...'
                  : !stripe
                    ? '⏳ Loading Stripe...'
                    : paymentOpen
                      ? `Subscribe — ₹${totalAmount.toLocaleString('en-IN')}`
                      : '🔒 Payment Window Closed'}
              </button>

              {!paymentOpen && (
                <div className="stripe-time-notice">
                  ⏰ Payments accepted only between 10:00 AM – 11:00 AM IST
                </div>
              )}

              {/* Test cards info */}
              <div className="stripe-test-cards">
                <div className="stripe-test-cards__title">🧪 Test Cards</div>
                <div className="stripe-test-cards__list">
                  <span><code>4242 4242 4242 4242</code> — Success</span>
                  <span><code>4000 0000 0000 0002</code> — Declined</span>
                  <span><code>4000 0025 0000 3155</code> — 3D Secure</span>
                </div>
              </div>

              <p className="stripe-terms">
                By subscribing, you agree to the <a href="#">Terms of Service</a> and will be charged ₹{totalAmount.toLocaleString('en-IN')}/month until you cancel.
              </p>
            </>
          )}

          {/* ════ PROCESSING STAGE ════ */}
          {stage === STAGES.PROCESSING && (
            <div className="stripe-processing">
              <div className="stripe-spinner">
                <div className="stripe-spinner__dot stripe-spinner__dot--1" />
                <div className="stripe-spinner__dot stripe-spinner__dot--2" />
                <div className="stripe-spinner__dot stripe-spinner__dot--3" />
              </div>
              <p className="stripe-processing__title">Processing payment</p>
              <p className="stripe-processing__sub">Securely communicating with Stripe...</p>
            </div>
          )}

          {/* ════ 3D SECURE AUTH STAGE ════ */}
          {stage === STAGES.AUTH && (
            <div className="stripe-auth">
              <div className="stripe-auth__shield">🛡️</div>
              <h3 className="stripe-auth__title">3D Secure Authentication</h3>
              <p className="stripe-auth__desc">
                Your bank has sent a verification code to<br/>
                <strong>{user.phone || user.email}</strong>
              </p>
              <div className="stripe-auth__inputs">
                {authCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (authRefs.current[i] = el)}
                    className="stripe-auth__digit"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleAuthChange(i, e.target.value)}
                    onKeyDown={e => handleAuthKeyDown(i, e)}
                  />
                ))}
              </div>
              {error && <div className="stripe-error">{error}</div>}
              <button className="stripe-pay-btn stripe-pay-btn--auth" onClick={handleVerifyAuth}>
                Authenticate & Pay
              </button>
              <p className="stripe-auth__timer">
                {authTimer > 0 ? (
                  <>Code expires in <strong>{authTimer}s</strong></>
                ) : (
                  <button className="stripe-link" onClick={() => { setAuthTimer(30); setAuthCode(['','','','','','']); }}>
                    Resend Code
                  </button>
                )}
              </p>
            </div>
          )}

          {/* ════ SUCCESS STAGE ════ */}
          {stage === STAGES.SUCCESS && (
            <div className="stripe-success">
              <div className="stripe-success__check">
                <svg viewBox="0 0 52 52" className="stripe-check-svg">
                  <circle className="stripe-check-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="stripe-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h3 className="stripe-success__title">Payment Successful!</h3>
              <p className="stripe-success__amount">₹{totalAmount.toLocaleString('en-IN')}</p>
              <p className="stripe-success__plan">{plan.name} Plan is now active</p>
              <div className="stripe-success__receipt">
                <span>Receipt sent to</span>
                <strong>{email}</strong>
              </div>
              <div className="stripe-success__stripe-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.076c0 3.865 2.36 5.537 6.196 6.974 2.446.916 3.282 1.577 3.282 2.601 0 .932-.77 1.473-2.163 1.473-1.857 0-4.727-.925-6.657-2.066l-.941 5.57C5.093 22.782 7.895 24 11.388 24c2.595 0 4.735-.64 6.233-1.857 1.638-1.322 2.479-3.225 2.479-5.652 0-3.963-2.394-5.58-6.124-7.341z" fill="#6772e5"/></svg>
                Processed securely by Stripe
              </div>
            </div>
          )}

          {/* ════ FAILED STAGE ════ */}
          {stage === STAGES.FAILED && (
            <div className="stripe-failed">
              <div className="stripe-failed__icon">✕</div>
              <h3 className="stripe-failed__title">Payment Failed</h3>
              <p className="stripe-failed__desc">{error || 'Your payment could not be processed.'}</p>
              <button className="stripe-pay-btn" onClick={() => { setStage(STAGES.FORM); setError(''); }}>
                Try Again
              </button>
              <button className="stripe-link stripe-link--cancel" onClick={onCancel}>Cancel</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Outer wrapper — provides the <Elements> Stripe context
   ══════════════════════════════════════════════════════════ */
// Memoize options outside component to prevent <Elements> re-initialization on re-render
const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
  ],
};

export default function StripeCheckout(props) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
