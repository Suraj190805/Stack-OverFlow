/**
 * Time Restrictions — IST Time Window Checks
 * PRD Module 2: Payments only 10:00 AM – 11:00 AM IST
 * PRD Module 5: Login only 10:00 AM – 1:00 PM IST (all devices)
 */

function getISTHour() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return { hour: ist.getHours(), minute: ist.getMinutes(), date: ist };
}

export function isPaymentWindowOpen() {
  const { hour } = getISTHour();
  return hour >= 10 && hour < 11; // 10:00 AM – 11:00 AM IST
}

export function isMobileLoginAllowed() {
  const { hour } = getISTHour();
  return hour >= 10 && hour < 13; // 10:00 AM – 1:00 PM IST
}

export function isLoginWindowOpen() {
  const { hour } = getISTHour();
  return hour >= 10 && hour < 13; // 10:00 AM – 1:00 PM IST
}

export function getPaymentWindowMessage() {
  return 'Payments are only accepted between 10:00 AM and 11:00 AM IST. Please try again during this window.';
}

export function getMobileLoginMessage() {
  return 'Mobile access is only available between 10:00 AM and 1:00 PM IST. Please try again during this window.';
}

export function getLoginWindowMessage() {
  return 'Login is only available between 10:00 AM and 1:00 PM IST. Please try again during this window.';
}

export function getCurrentIST() {
  const { date } = getISTHour();
  return date;
}

export function formatIST(dateStr) {
  const date = new Date(dateStr);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return ist.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  }) + ' IST';
}
