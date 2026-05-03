/**
 * Password Generator — Letters Only (A-Z, a-z)
 * PRD: Generated passwords must contain only uppercase and lowercase English letters.
 * No numbers, special characters, or spaces.
 * Recommended length: 10-16 characters.
 */

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const ALL_CHARS = UPPERCASE + LOWERCASE;

export function generatePassword(length = 12) {
  if (length < 10) length = 10;
  if (length > 16) length = 16;

  let password = '';

  // Guarantee at least one uppercase and one lowercase
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];

  // Fill remaining characters
  for (let i = 2; i < length; i++) {
    password += ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
  }

  // Fisher-Yates shuffle
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}
