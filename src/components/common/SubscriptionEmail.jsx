import React, { useState, useEffect } from 'react';
import { generateInvoiceHTML } from '../../utils/emailService';
import './SubscriptionEmail.css';

/**
 * SubscriptionEmail — Confirmation modal shown after email attempt
 * Displays email status (success or failure), plan details, invoice, and download option.
 * Supports retry for failed email sends.
 */
export default function SubscriptionEmail({ invoice, emailResult, onClose, onRetryEmail }) {
  const [downloading, setDownloading] = useState(false);

  // Determine if email was actually sent successfully
  const emailSent = emailResult?.success === true;
  const emailFailed = emailResult && !emailResult.success;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleDownloadInvoice = () => {
    setDownloading(true);
    const html = generateInvoiceHTML(invoice);
    const printWin = window.open('', '_blank', 'width=700,height=900');
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      setDownloading(false);
    }, 500);
  };

  const handleViewEmail = () => {
    const html = generateInvoiceHTML(invoice);
    const emailWin = window.open('', '_blank', 'width=700,height=900');
    emailWin.document.write(html);
    emailWin.document.close();
    emailWin.focus();
  };

  const gst = Math.round(invoice.amount * 0.18);
  const total = invoice.amount + gst;

  return (
    <div className="email-sent-overlay" onClick={onClose}>
      <div className="email-sent-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Banner — changes based on email result */}
        <div className={`email-sent-header ${emailFailed ? 'email-sent-header--failed' : ''}`}>
          <div className="email-sent-icon">
            <span className="email-sent-icon__envelope">
              {emailFailed ? '⚠️' : '📧'}
            </span>
          </div>
          <h2 className="email-sent-title">
            {emailFailed ? 'Email Delivery Failed' : 'Invoice Email Sent!'}
          </h2>
          <p className="email-sent-subtitle">
            {emailFailed
              ? 'Your payment was successful, but the invoice email could not be delivered'
              : 'A detailed invoice has been emailed to you'}
          </p>
        </div>

        {/* Body */}
        <div className="email-sent-body">
          {/* Status Indicators */}
          <div className="email-sent-status">
            <div className="email-status-item email-status-item--success">
              <span className="email-status-item__icon">✅</span>
              <span className="email-status-item__text">
                <strong>Payment processed</strong> — ₹{total} charged successfully
              </span>
            </div>

            {emailSent ? (
              <div className="email-status-item email-status-item--success">
                <span className="email-status-item__icon">📧</span>
                <span className="email-status-item__text">
                  <strong>Invoice emailed</strong> to <strong>{invoice.email}</strong>
                </span>
              </div>
            ) : (
              <div className="email-status-item email-status-item--error">
                <span className="email-status-item__icon">❌</span>
                <span className="email-status-item__text">
                  <strong>Email failed</strong> — Could not send to <strong>{invoice.email}</strong>
                  {emailResult?.error && (
                    <span className="email-error-detail">
                      <br />Error: {emailResult.error}
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="email-status-item email-status-item--info">
              <span className="email-status-item__icon">🔄</span>
              <span className="email-status-item__text">
                <strong>Next renewal:</strong> {invoice.nextRenewal}
              </span>
            </div>
          </div>

          {/* Plan Summary */}
          <div className="email-sent-plan">
            <span className="email-sent-plan__icon">{invoice.planIcon}</span>
            <div className="email-sent-plan__info">
              <div className="email-sent-plan__name">{invoice.planName} Plan</div>
              <div className="email-sent-plan__meta">
                {invoice.questionsPerDay} questions/day • Monthly
              </div>
            </div>
            <div className="email-sent-plan__amount">₹{total}</div>
          </div>

          {/* Invoice Details */}
          <div className="email-sent-details">
            <div className="email-sent-detail-row">
              <span className="email-sent-detail-label">Invoice No.</span>
              <span className="email-sent-detail-value">{invoice.invoiceNo}</span>
            </div>
            <div className="email-sent-detail-row">
              <span className="email-sent-detail-label">Billed To</span>
              <span className="email-sent-detail-value">{invoice.user}</span>
            </div>
            <div className="email-sent-detail-row">
              <span className="email-sent-detail-label">Payment Method</span>
              <span className="email-sent-detail-value">{invoice.paymentMethod}</span>
            </div>
            <div className="email-sent-detail-row">
              <span className="email-sent-detail-label">Transaction ID</span>
              <span className="email-sent-detail-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {invoice.txnId}
              </span>
            </div>
            <div className="email-sent-detail-row">
              <span className="email-sent-detail-label">Billing Date</span>
              <span className="email-sent-detail-value">{invoice.billingDate}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="email-sent-actions">
            {emailFailed && onRetryEmail && (
              <button
                className="email-sent-btn email-sent-btn--retry"
                onClick={onRetryEmail}
              >
                🔄 Retry Email
              </button>
            )}
            <button
              className="email-sent-btn email-sent-btn--secondary"
              onClick={handleViewEmail}
            >
              👁️ Preview Email
            </button>
            <button
              className="email-sent-btn email-sent-btn--secondary"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              {downloading ? '⏳ Preparing...' : '📥 Download Invoice'}
            </button>
            <button
              className="email-sent-btn email-sent-btn--primary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
