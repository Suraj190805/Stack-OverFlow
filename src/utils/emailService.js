/**
 * Email Service — Real Email Delivery via EmailJS
 * ─────────────────────────────────────────────────
 * Sends actual invoice emails to the user's Gmail/email after payment.
 *
 * Uses @emailjs/browser for client-side email delivery (no backend needed).
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  SETUP (one-time, takes ~3 minutes):                │
 * │                                                     │
 * │  1. Go to https://www.emailjs.com/                  │
 * │  2. Sign up (free — 200 emails/month)               │
 * │  3. Add Email Service:                              │
 * │     → Email Services → Add New → Gmail              │
 * │     → Connect your Gmail account                    │
 * │     → Copy the Service ID                           │
 * │  4. Create Email Template:                          │
 * │     → Email Templates → Create New                  │
 * │     → Subject: Invoice {{invoice_no}} - {{plan}}    │
 * │     → Body: (paste the template below)              │
 * │     → Copy the Template ID                          │
 * │  5. Get Public Key:                                 │
 * │     → Account → General → Public Key                │
 * │  6. Add to .env:                                    │
 * │     VITE_EMAILJS_SERVICE_ID=service_xxxxx           │
 * │     VITE_EMAILJS_TEMPLATE_ID=template_xxxxx         │
 * │     VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx            │
 * │  7. Restart dev server (npm run dev)                │
 * └─────────────────────────────────────────────────────┘
 *
 * EMAIL TEMPLATE (paste into EmailJS template body):
 * ──────────────────────────────────────────────────
 * Hi {{to_name}},
 *
 * Thank you for subscribing to Stack Overflow {{plan_name}} Plan!
 *
 * INVOICE DETAILS:
 * ─────────────────
 * Invoice No: {{invoice_no}}
 * Plan: {{plan_name}} Plan
 * Questions/Day: {{questions_per_day}}
 * Subtotal: {{amount}}
 * GST (18%): {{gst}}
 * Total Paid: {{total}}
 *
 * PAYMENT INFO:
 * ─────────────────
 * Transaction ID: {{txn_id}}
 * Payment Method: {{payment_method}}
 * Billing Date: {{billing_date}}
 * Next Renewal: {{next_renewal}}
 *
 * Your subscription is now active. Enjoy unlimited access!
 *
 * — Stack Overflow Team
 */

import emailjs from '@emailjs/browser';

// EmailJS credentials from environment
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS once
let initialized = false;
function initEmailJS() {
  if (!initialized && EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    initialized = true;
  }
}

/**
 * Check if EmailJS is configured with real credentials
 */
export function isEmailConfigured() {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

/**
 * Send subscription invoice email
 *
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {Object} params.invoice - Invoice data
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendInvoiceEmail({ toEmail, toName, invoice }) {
  const gst = Math.round(invoice.amount * 0.18);
  const total = invoice.amount + gst;

  // Generate the full HTML invoice for the email body
  const invoiceHTML = generateInvoiceHTML(invoice);

  // Build template parameters (these map to {{variable}} in the EmailJS template)
  // The "message" field contains the full HTML invoice — use {{{message}}} in the template
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    reply_to: toEmail,
    subject: `Invoice ${invoice.invoiceNo} — ${invoice.planName} Plan`,

    // ── Invoice details (individual vars for flexible templates) ──
    invoice_no: invoice.invoiceNo,
    plan_name: invoice.planName,
    plan_icon: invoice.planIcon || '',
    amount: `₹${invoice.amount.toLocaleString('en-IN')}`,
    gst: `₹${gst.toLocaleString('en-IN')}`,
    total: `₹${total.toLocaleString('en-IN')}`,
    txn_id: invoice.txnId,
    payment_method: invoice.paymentMethod,
    billing_date: invoice.billingDate,
    next_renewal: invoice.nextRenewal,
    questions_per_day: invoice.questionsPerDay,

    // ── Full HTML invoice body — use {{{message}}} in the EmailJS template ──
    message: invoiceHTML,
  };

  // ── Try real email via EmailJS ──
  if (isEmailConfigured()) {
    try {
      initEmailJS();

      console.log('📧 Sending real email via EmailJS to:', toEmail);
      console.log('📧 Service ID:', EMAILJS_SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_TEMPLATE_ID);
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email sent successfully!', response.status, response.text);

      // Record sent email in localStorage
      recordSentEmail(toEmail, toName, invoice, total, 'emailjs');

      return { success: true, method: 'emailjs' };
    } catch (err) {
      console.error('❌ EmailJS send failed:', err);
      console.error('❌ Error status:', err?.status);
      console.error('❌ Error text:', err?.text);
      
      // Build a user-friendly error message based on the status code
      let errorMessage = 'Email delivery failed.';
      const status = err?.status;
      
      if (status === 400) {
        errorMessage = 'EmailJS template configuration error (400). Please verify: 1) Template ID matches your EmailJS dashboard, 2) Template "To Email" field is set to {{to_email}}, 3) All required template variables are present.';
      } else if (status === 401 || status === 403) {
        errorMessage = 'EmailJS authentication failed. Please check your Public Key in .env matches your EmailJS account.';
      } else if (status === 429) {
        errorMessage = 'EmailJS rate limit reached (free tier: 200 emails/month). Please try again later or upgrade your EmailJS plan.';
      } else if (err?.text) {
        errorMessage = err.text;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Record failed attempt
      recordSentEmail(toEmail, toName, invoice, total, 'failed');

      return { 
        success: false, 
        method: 'emailjs', 
        error: errorMessage
      };
    }
  }

  // ── Fallback: Simulation mode (no EmailJS configured) ──
  console.warn('⚠️ EmailJS not configured! Running in SIMULATION mode.');
  console.warn('⚠️ Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to .env');
  console.log('📧 [SIMULATED] Invoice email to:', toEmail);
  console.log('📧 [SIMULATED] Template params:', templateParams);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  // Record simulated email
  recordSentEmail(toEmail, toName, invoice, total, 'simulation');

  return { success: true, method: 'simulation' };
}

/**
 * Record sent email in localStorage for tracking
 */
function recordSentEmail(toEmail, toName, invoice, total, method) {
  const sentEmails = JSON.parse(localStorage.getItem('so_sent_emails') || '[]');
  sentEmails.unshift({
    id: `email_${Date.now()}`,
    to: toEmail,
    toName,
    subject: `Invoice ${invoice.invoiceNo} — ${invoice.planName} Plan Subscription`,
    invoiceNo: invoice.invoiceNo,
    planName: invoice.planName,
    amount: invoice.amount,
    total,
    sentAt: new Date().toISOString(),
    status: method === 'failed' ? 'failed' : 'delivered',
    method,
  });
  localStorage.setItem('so_sent_emails', JSON.stringify(sentEmails));
}

/**
 * Generate invoice HTML for email body / download
 */
export function generateInvoiceHTML(invoice) {
  const gst = Math.round(invoice.amount * 0.18);
  const total = invoice.amount + gst;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #232629; background: #f6f6f6; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .email-header { background: linear-gradient(135deg, #232629 0%, #3a3d41 100%); padding: 32px; text-align: center; }
    .email-logo { font-size: 24px; font-weight: 700; color: #fff; }
    .email-logo span { color: #F48225; }
    .email-subtitle { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px; }
    .email-body { padding: 32px; }
    .email-greeting { font-size: 18px; color: #232629; margin-bottom: 8px; }
    .email-message { font-size: 14px; color: #6A737C; line-height: 1.6; margin-bottom: 24px; }
    .email-plan-badge { display: inline-block; padding: 8px 20px; background: #F48225; color: #fff; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    .email-invoice-box { border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    .email-invoice-header { background: #F8F9F9; padding: 12px 16px; border-bottom: 1px solid #E8E8E8; }
    .email-invoice-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6A737C; font-weight: 600; }
    .email-invoice-no { font-size: 13px; color: #232629; font-weight: 600; float: right; }
    .email-invoice-row { padding: 12px 16px; border-bottom: 1px solid #F1F2F3; font-size: 14px; overflow: hidden; }
    .email-invoice-row:last-child { border-bottom: none; }
    .email-invoice-row.total { background: #F8F9F9; font-weight: 700; font-size: 16px; }
    .email-invoice-label { float: left; color: #6A737C; }
    .email-invoice-value { float: right; color: #232629; font-weight: 600; }
    .email-paid { text-align: center; margin: 24px 0; }
    .email-paid-badge { display: inline-block; padding: 8px 24px; background: #EDF4ED; color: #2F6F44; border-radius: 20px; font-size: 14px; font-weight: 600; border: 1px solid #A6D9A8; }
    .email-footer { background: #F8F9F9; padding: 24px 32px; text-align: center; border-top: 1px solid #E8E8E8; }
    .email-footer p { font-size: 12px; color: #6A737C; line-height: 1.6; }
    .email-footer a { color: #0074CC; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="email-logo">Stack<span>Overflow</span></div>
      <div class="email-subtitle">Subscription Invoice</div>
    </div>
    <div class="email-body">
      <p class="email-greeting">Hi ${invoice.user},</p>
      <p class="email-message">
        Thank you for subscribing! Your payment has been processed successfully.
        Here are your subscription details and invoice.
      </p>

      <div style="text-align:center;margin-bottom:24px;">
        <span class="email-plan-badge">${invoice.planIcon} ${invoice.planName} Plan — Active</span>
      </div>

      <div class="email-invoice-box">
        <div class="email-invoice-header">
          <span class="email-invoice-title">Invoice</span>
          <span class="email-invoice-no">${invoice.invoiceNo}</span>
        </div>
        <div class="email-invoice-row">
          <span class="email-invoice-label">${invoice.planName} Plan (Monthly)</span>
          <span class="email-invoice-value">₹${invoice.amount}</span>
          <div style="clear:both"></div>
        </div>
        <div class="email-invoice-row">
          <span class="email-invoice-label">Questions/Day</span>
          <span class="email-invoice-value">${invoice.questionsPerDay}</span>
          <div style="clear:both"></div>
        </div>
        <div class="email-invoice-row">
          <span class="email-invoice-label">GST (18%)</span>
          <span class="email-invoice-value">₹${gst}</span>
          <div style="clear:both"></div>
        </div>
        <div class="email-invoice-row total">
          <span class="email-invoice-label">Total Paid</span>
          <span class="email-invoice-value">₹${total}</span>
          <div style="clear:both"></div>
        </div>
      </div>

      <div class="email-paid">
        <span class="email-paid-badge">✓ PAYMENT SUCCESSFUL</span>
      </div>

      <p class="email-message">
        <strong>Transaction ID:</strong> ${invoice.txnId}<br/>
        <strong>Payment Method:</strong> ${invoice.paymentMethod}<br/>
        <strong>Billing Date:</strong> ${invoice.billingDate}<br/>
        <strong>Next Renewal:</strong> ${invoice.nextRenewal}
      </p>

      <p class="email-message" style="margin-bottom:0;">
        Your subscription renews on <strong>${invoice.nextRenewal}</strong>.
        You can manage your subscription from your account settings.
      </p>
    </div>
    <div class="email-footer">
      <p>This is an automated invoice from Stack Overflow.</p>
      <p style="margin-top:12px;font-size:11px;color:#9FA6AD;">
        Computer-generated invoice — no signature required.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send OTP email for forgot password verification
 *
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {string} params.otp - The OTP code to send
 * @param {string} params.purpose - Purpose (e.g. "Password Reset")
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendOtpEmail({ toEmail, toName, otp, purpose = 'Password Reset' }) {
  const EMAILJS_OTP_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID;

  // Template params matching the OTP email template on EmailJS dashboard.
  // Template should have: To Email = {{to_email}}, Subject = {{subject}}
  // Body uses: {{to_name}}, {{otp_code}}
  const templateParams = {
    to_email: toEmail,
    to_name: toName || 'User',
    reply_to: toEmail,
    otp_code: otp,
    subject: `${otp} — Your Stack Overflow Password Reset Code`,
    message: `Your one-time password (OTP) for password reset is: ${otp}. This code is valid for 5 minutes. Do not share this code with anyone.`,
  };

  // ── Try real email via EmailJS ──
  if (isEmailConfigured() && EMAILJS_OTP_TEMPLATE_ID) {
    try {
      initEmailJS();

      console.log('📧 Sending OTP email via EmailJS to:', toEmail);
      console.log('📧 Using OTP template:', EMAILJS_OTP_TEMPLATE_ID);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ OTP email sent successfully!', response.status, response.text);

      // Record sent OTP email
      recordOtpEmail(toEmail, toName, otp, purpose, 'emailjs');

      return { success: true, method: 'emailjs' };
    } catch (err) {
      console.error('❌ OTP email send failed:', err);

      recordOtpEmail(toEmail, toName, otp, purpose, 'failed');

      return {
        success: false,
        method: 'emailjs',
        error: err?.text || err?.message || 'OTP email delivery failed.',
      };
    }
  }

  // ── Fallback: Simulation mode ──
  if (!EMAILJS_OTP_TEMPLATE_ID) {
    console.warn('⚠️ VITE_EMAILJS_OTP_TEMPLATE_ID not set in .env!');
    console.warn('⚠️ Create an OTP template on https://dashboard.emailjs.com/admin/templates');
    console.warn('⚠️ See .env comments for setup instructions.');
  } else {
    console.warn('⚠️ EmailJS not fully configured! Running OTP in SIMULATION mode.');
  }
  console.log('📧 [SIMULATED] OTP email to:', toEmail);
  console.log('📧 [SIMULATED] OTP Code:', otp);

  await new Promise((r) => setTimeout(r, 800));

  recordOtpEmail(toEmail, toName, otp, purpose, 'simulation');

  return { success: true, method: 'simulation' };
}

/**
 * Record sent OTP email in localStorage for tracking
 */
function recordOtpEmail(toEmail, toName, otp, purpose, method) {
  const sentEmails = JSON.parse(localStorage.getItem('so_sent_emails') || '[]');
  sentEmails.unshift({
    id: `otp_${Date.now()}`,
    to: toEmail,
    toName,
    subject: `${otp} is your Stack Overflow verification code`,
    type: 'otp',
    purpose,
    sentAt: new Date().toISOString(),
    status: method === 'failed' ? 'failed' : 'delivered',
    method,
  });
  localStorage.setItem('so_sent_emails', JSON.stringify(sentEmails));
}

export default {
  sendInvoiceEmail,
  sendOtpEmail,
  isEmailConfigured,
  generateInvoiceHTML,
};
