import React, { useRef } from 'react';
import './InvoiceEmail.css';

export default function InvoiceEmail({ invoice, onClose }) {
  const invoiceRef = useRef(null);

  const handleDownload = () => {
    // Create printable version
    const printWin = window.open('', '_blank', 'width=700,height=900');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; color: #232629; }
          .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #F48225; }
          .inv-logo { font-size: 24px; font-weight: 700; color: #232629; }
          .inv-logo span { color: #F48225; }
          .inv-label { font-size: 28px; font-weight: 300; color: #6A737C; }
          .inv-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .inv-meta-group h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6A737C; margin-bottom: 6px; }
          .inv-meta-group p { font-size: 14px; color: #232629; line-height: 1.6; }
          .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .inv-table th { text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6A737C; border-bottom: 2px solid #D6D9DC; }
          .inv-table td { padding: 12px; font-size: 14px; border-bottom: 1px solid #E8E8E8; }
          .inv-table .amount { text-align: right; font-weight: 600; }
          .inv-total { display: flex; justify-content: flex-end; margin-bottom: 32px; }
          .inv-total-box { border: 2px solid #F48225; border-radius: 8px; padding: 16px 24px; text-align: right; }
          .inv-total-label { font-size: 12px; color: #6A737C; text-transform: uppercase; }
          .inv-total-amount { font-size: 28px; font-weight: 700; color: #232629; }
          .inv-footer { text-align: center; padding-top: 24px; border-top: 1px solid #E8E8E8; font-size: 12px; color: #6A737C; }
          .inv-badge { display: inline-block; padding: 4px 12px; background: #2F6F44; color: #fff; border-radius: 20px; font-size: 12px; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="inv-header">
          <div>
            <div class="inv-logo">Stack<span>Overflow</span></div>
            <p style="font-size: 12px; color: #6A737C; margin-top: 4px;">Subscription Services</p>
          </div>
          <div style="text-align: right;">
            <div class="inv-label">INVOICE</div>
            <p style="font-size: 13px; color: #6A737C;">${invoice.invoiceNo}</p>
          </div>
        </div>
        <div class="inv-meta">
          <div class="inv-meta-group">
            <h4>Billed To</h4>
            <p><strong>${invoice.user}</strong><br/>${invoice.email}</p>
          </div>
          <div class="inv-meta-group" style="text-align:right;">
            <h4>Payment Details</h4>
            <p>Date: ${invoice.billingDate}<br/>Method: ${invoice.paymentMethod}<br/>Txn ID: ${invoice.txnId}</p>
          </div>
        </div>
        <table class="inv-table">
          <thead><tr><th>Description</th><th>Period</th><th>Qty</th><th class="amount">Amount</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>${invoice.planName} Plan</strong><br/><span style="font-size:12px;color:#6A737C;">${invoice.questionsPerDay} questions per day</span></td>
              <td>Monthly</td>
              <td>1</td>
              <td class="amount">₹${invoice.amount}</td>
            </tr>
            <tr>
              <td>GST (18%)</td><td></td><td></td>
              <td class="amount">₹${Math.round(invoice.amount * 0.18)}</td>
            </tr>
          </tbody>
        </table>
        <div class="inv-total">
          <div class="inv-total-box">
            <div class="inv-total-label">Total Paid</div>
            <div class="inv-total-amount">₹${invoice.amount + Math.round(invoice.amount * 0.18)}</div>
          </div>
        </div>
        <div style="text-align:center;margin-bottom:20px;"><span class="inv-badge">✓ PAID</span></div>
        <div class="inv-footer">
          <p>Thank you for your subscription!</p>
          <p style="margin-top:4px;">Next renewal: ${invoice.nextRenewal}</p>
          <p style="margin-top:12px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()} ref={invoiceRef}>
        {/* Invoice Preview */}
        <div className="inv-preview">
          <div className="inv-preview-header">
            <div className="inv-preview-brand">
              <div className="inv-preview-logo">Stack<span>Overflow</span></div>
              <div className="inv-preview-sub">Subscription Services</div>
            </div>
            <div className="inv-preview-info">
              <div className="inv-preview-label">INVOICE</div>
              <div className="inv-preview-no">{invoice.invoiceNo}</div>
            </div>
          </div>

          <div className="inv-preview-meta">
            <div className="inv-preview-meta-group">
              <h4>Billed To</h4>
              <p className="inv-meta-value">{invoice.user}</p>
              <p className="inv-meta-detail">{invoice.email}</p>
            </div>
            <div className="inv-preview-meta-group inv-preview-meta-group--right">
              <h4>Payment Info</h4>
              <p className="inv-meta-value">{invoice.billingDate}</p>
              <p className="inv-meta-detail">{invoice.paymentMethod}</p>
              <p className="inv-meta-detail inv-meta-txn">{invoice.txnId}</p>
            </div>
          </div>

          <div className="inv-preview-items">
            <div className="inv-preview-item">
              <div className="inv-item-desc">
                <span className="inv-item-plan-icon">{invoice.planIcon}</span>
                <div>
                  <strong>{invoice.planName} Plan</strong>
                  <span className="inv-item-sub">{invoice.questionsPerDay} questions/day • Monthly</span>
                </div>
              </div>
              <div className="inv-item-amount">₹{invoice.amount}</div>
            </div>
            <div className="inv-preview-item inv-preview-item--tax">
              <div className="inv-item-desc">GST (18%)</div>
              <div className="inv-item-amount">₹{Math.round(invoice.amount * 0.18)}</div>
            </div>
          </div>

          <div className="inv-preview-total">
            <span className="inv-preview-total-label">Total Paid</span>
            <span className="inv-preview-total-amount">₹{invoice.amount + Math.round(invoice.amount * 0.18)}</span>
          </div>

          <div className="inv-preview-paid-badge">
            <span className="inv-paid-check">✓</span> PAID
          </div>

          <div className="inv-preview-renewal">
            Next renewal: <strong>{invoice.nextRenewal}</strong>
          </div>
        </div>

        {/* Email Simulation */}
        <div className="inv-email-notice">
          <div className="inv-email-icon">📧</div>
          <div className="inv-email-text">
            <strong>Invoice emailed!</strong>
            <span>A copy has been sent to {invoice.email}</span>
          </div>
          <div className="inv-email-check">✓</div>
        </div>

        {/* Actions */}
        <div className="inv-actions">
          <button className="inv-btn inv-btn--download" onClick={handleDownload}>
            📥 Download Invoice
          </button>
          <button className="inv-btn inv-btn--close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
