/**
 * Device Detection — Browser, OS, Device Type
 * PRD Module 5: Capture browser type, OS, device type, IP address, login timestamp, login status.
 */

export function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Microsoft Edge';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Google Chrome';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
}

export function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
}

export function getDeviceType() {
  const ua = navigator.userAgent;
  // Check for mobile indicators
  if (/Mobi|Android|iPhone|iPad|iPod|Phone|Mobile/i.test(ua)) {
    return 'Mobile';
  }
  // Check screen size and touch capability as backup
  if (window.innerWidth <= 768 && 'ontouchstart' in window) {
    return 'Mobile';
  }
  if (window.innerWidth <= 1024) {
    return 'Laptop';
  }
  return 'Desktop';
}

export async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '127.0.0.1';
  }
}

export function getLoginMetadata() {
  return {
    browser: getBrowserName(),
    os: getOS(),
    deviceType: getDeviceType(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * PRD Module 5: Authentication rules by browser
 * - Chrome: OTP via email required
 * - Edge/IE: No additional authentication (direct access)
 * - Others: Standard username/password only
 */
export function getAuthRequirement() {
  const browser = getBrowserName();
  if (browser === 'Google Chrome') return 'email_otp';
  if (browser === 'Microsoft Edge' || browser === 'Internet Explorer') return 'direct';
  return 'standard';
}
