import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { SUBSCRIPTION_PLANS } from '../data/mockUsers';
import { isPaymentWindowOpen, getPaymentWindowMessage, formatIST } from '../utils/timeRestrictions';
import { sendInvoiceEmail } from '../utils/emailService';
import StripeCheckout from '../components/common/StripeCheckout';
import InvoiceEmail from '../components/common/InvoiceEmail';
import SubscriptionEmail from '../components/common/SubscriptionEmail';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Subscription.css';

export default function Subscription() {
  const { currentUser, updateUser } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [transactions, setTransactions] = useLocalStorage('so_transactions', []);

  // Email sent confirmation state
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!currentUser) return <Navigate to="/login" />;

  const paymentOpen = isPaymentWindowOpen();

  const handleSelectPlan = async (plan) => {
    if (plan.id === currentUser.plan) return;

    // Free plan — instant switch, no payment needed
    if (plan.id === 'free') {
      await updateUser(currentUser._id, { plan: 'free' });
      toast.info('Switched to Free plan');

      // Record downgrade transaction
      const txn = {
        id: `txn_${Date.now()}`,
        userId: currentUser._id,
        type: 'downgrade',
        planFrom: currentUser.plan,
        planTo: 'free',
        amount: 0,
        timestamp: new Date().toISOString(),
      };
      setTransactions(prev => [txn, ...prev]);
      return;
    }

    // Paid plans — enforce time window
    if (!paymentOpen) {
      toast.warning(getPaymentWindowMessage());
      return;
    }

    // Open Razorpay checkout
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    // Update user plan
    await updateUser(currentUser._id, { plan: selectedPlan.id });

    // Generate invoice
    const invoice = {
      invoiceNo: `INV-${Date.now().toString().slice(-8)}`,
      planName: selectedPlan.name,
      planIcon: selectedPlan.icon,
      amount: selectedPlan.price,
      questionsPerDay: selectedPlan.questionsPerDay === Infinity ? 'Unlimited' : `${selectedPlan.questionsPerDay}`,
      billingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      nextRenewal: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      user: currentUser.displayName,
      email: currentUser.email,
      txnId: paymentData.txnId,
      paymentMethod: paymentData.methodLabel,
    };

    // Record transaction
    const txn = {
      id: paymentData.txnId,
      userId: currentUser._id,
      type: 'upgrade',
      planFrom: currentUser.plan,
      planTo: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      amountWithGst: selectedPlan.price + Math.round(selectedPlan.price * 0.18),
      paymentMethod: paymentData.methodLabel,
      invoiceNo: invoice.invoiceNo,
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [txn, ...prev]);

    setInvoiceData(invoice);
    setShowCheckout(false);
    toast.success(`Upgraded to ${selectedPlan.name}! 🎉`);

    // ── AUTO-SEND EMAIL with invoice + subscription details ──
    setSendingEmail(true);
    try {
      const result = await sendInvoiceEmail({
        toEmail: currentUser.email,
        toName: currentUser.displayName,
        invoice,
      });
      setEmailResult(result);
      setShowEmailSent(true);

      if (result.success) {
        toast.success('📧 Invoice emailed to ' + currentUser.email);
      } else {
        toast.error('❌ Invoice email failed — you can retry or download the invoice');
      }
    } catch (err) {
      console.error('Email send error:', err);
      setEmailResult({ success: false, error: err.message });
      // Show the email confirmation modal with error state (not the invoice)
      setShowEmailSent(true);
      toast.error('❌ Could not send invoice email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!invoiceData || !currentUser) return;
    setSendingEmail(true);
    setShowEmailSent(false);
    try {
      const result = await sendInvoiceEmail({
        toEmail: currentUser.email,
        toName: currentUser.displayName,
        invoice: invoiceData,
      });
      setEmailResult(result);
      setShowEmailSent(true);
      if (result.success) {
        toast.success('📧 Invoice emailed to ' + currentUser.email);
      } else {
        toast.error('❌ Email retry failed — ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Email retry error:', err);
      setEmailResult({ success: false, error: err.message });
      setShowEmailSent(true);
      toast.error('❌ Email retry failed');
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleEmailSentClose = () => {
    setShowEmailSent(false);
    setEmailResult(null);
    // After closing email confirmation, show the invoice preview
    setShowInvoice(true);
  };

  const userTransactions = transactions.filter(tx => tx.userId === currentUser?._id);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div className="page-header text-center">
          <h1 className="page-title">{t('subscription.title')}</h1>
          <p className="page-subtitle">{t('subscription.subtitle')}</p>
        </div>

        {/* Current Plan Banner */}
        <div className="sub-current-banner">
          <div className="sub-current-banner__info">
            <span className="sub-current-banner__icon">
              {SUBSCRIPTION_PLANS.find(p => p.id === currentUser.plan)?.icon || '🆓'}
            </span>
            <div>
              <div className="sub-current-banner__label">Your Current Plan</div>
              <div className="sub-current-banner__plan">
                {SUBSCRIPTION_PLANS.find(p => p.id === currentUser.plan)?.name || 'Free'}
              </div>
            </div>
          </div>
          <div className="sub-current-banner__quota">
            {(() => {
              const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentUser.plan) || SUBSCRIPTION_PLANS[0];
              return plan.questionsPerDay === Infinity
                ? '∞ questions/day'
                : `${plan.questionsPerDay} question${plan.questionsPerDay > 1 ? 's' : ''}/day`;
            })()}
          </div>
        </div>

        {/* Payment Window Alert */}
        {!paymentOpen && (
          <div className="alert alert--info payment-window-alert">
            <span className="payment-alert-icon">⏰</span>
            <div>
              <strong>Payment Window Closed</strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px' }}>
                {t('subscription.paymentWindow')}
              </p>
            </div>
          </div>
        )}

        {paymentOpen && (
          <div className="alert alert--success payment-window-alert">
            <span className="payment-alert-icon">✅</span>
            <div>
              <strong>Payment Window Open!</strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px' }}>
                You can upgrade your plan now. Window closes at 11:00 AM IST.
              </p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="plans-grid">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isCurrent = currentUser.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`plan-card ${isCurrent ? 'plan-card--active' : ''} ${plan.id === 'gold' ? 'plan-card--featured' : ''} plan-card--${plan.id}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.id === 'gold' && <div className="plan-card__ribbon">⭐ Most Popular</div>}
                <div className="plan-card__glow" />
                <div className="plan-card__icon">{plan.icon}</div>
                <h3 className="plan-card__name">{plan.name}</h3>
                <div className="plan-card__price">
                  {plan.price === 0 ? 'Free' : (
                    <>₹{plan.price}<span className="plan-card__period">{t('subscription.perMonth')}</span></>
                  )}
                </div>
                <ul className="plan-card__features">
                  <li>
                    <span className="plan-feature-check">✓</span>
                    {plan.questionsPerDay === Infinity ? t('subscription.unlimited') : plan.questionsPerDay} {t('subscription.questionsPerDay')}
                  </li>
                  <li><span className="plan-feature-check">✓</span>Access to all questions</li>
                  <li><span className="plan-feature-check">✓</span>Community support</li>
                  {(plan.id === 'silver' || plan.id === 'gold') && <li><span className="plan-feature-check">✓</span>Advanced analytics</li>}
                  {plan.id === 'gold' && <li><span className="plan-feature-check">✓</span>Priority support</li>}
                  {plan.id === 'gold' && <li><span className="plan-feature-check">✓</span>Custom profile badge</li>}
                  {plan.price > 0 && (
                    <li><span className="plan-feature-check">✓</span>📧 Invoice emailed on payment</li>
                  )}
                </ul>
                {isCurrent ? (
                  <button className="btn btn--success btn--full plan-card__btn" disabled>
                    ✓ {t('subscription.currentPlan')}
                  </button>
                ) : (
                  <button
                    className="btn btn--primary btn--full plan-card__btn"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!paymentOpen && plan.price > 0}
                  >
                    {plan.price === 0 ? 'Switch to Free' : (
                      `${t('subscription.payNow')} — ₹${plan.price}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Transaction History */}
        {userTransactions.length > 0 && (
          <div className="sub-txn-section">
            <h2 className="section-title">💳 Transaction History</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Plan</th>
                    <th>Method</th>
                    <th>Invoice</th>
                    <th>Email</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {userTransactions.slice(0, 10).map(txn => {
                    // Check if email was sent for this transaction
                    const sentEmails = JSON.parse(localStorage.getItem('so_sent_emails') || '[]');
                    const emailSent = sentEmails.find(e => e.invoiceNo === txn.invoiceNo);

                    return (
                      <tr key={txn.id}>
                        <td>{formatIST(txn.timestamp)}</td>
                        <td>
                          <span className={`sub-txn-badge sub-txn-badge--${txn.type}`}>
                            {txn.type === 'upgrade' ? '⬆ Upgrade' : '⬇ Downgrade'}
                          </span>
                        </td>
                        <td><strong>{txn.planName || txn.planTo}</strong></td>
                        <td>{txn.paymentMethod || '—'}</td>
                        <td><span className="sub-txn-invoice">{txn.invoiceNo || '—'}</span></td>
                        <td>
                          {emailSent ? (
                            <span className="sub-txn-badge sub-txn-badge--upgrade" style={{ fontSize: '10px' }}>
                              ✓ Sent
                            </span>
                          ) : txn.type === 'upgrade' ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                          ) : '—'}
                        </td>
                        <td className="sub-txn-amount">
                          {txn.amount > 0 ? `₹${txn.amountWithGst || txn.amount}` : 'Free'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && selectedPlan && (
        <StripeCheckout
          plan={selectedPlan}
          user={currentUser}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Email Sent Confirmation Modal — shown FIRST after payment */}
      {showEmailSent && invoiceData && (
        <SubscriptionEmail
          invoice={invoiceData}
          emailResult={emailResult}
          onClose={handleEmailSentClose}
          onRetryEmail={handleRetryEmail}
        />
      )}

      {/* Invoice Preview Modal — shown AFTER email confirmation is closed */}
      {showInvoice && invoiceData && (
        <InvoiceEmail
          invoice={invoiceData}
          onClose={() => { setShowInvoice(false); setInvoiceData(null); }}
        />
      )}

      {/* Sending email loading overlay */}
      {sendingEmail && (
        <div className="email-sent-overlay" style={{ zIndex: 1200 }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            animation: 'emailModalSlideIn 0.3s ease both',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📧</div>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sending invoice email...
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              To: {currentUser.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
