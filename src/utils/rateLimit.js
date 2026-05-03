/**
 * Rate Limiter — Once Per Day Per Identifier
 * PRD: The system must record the timestamp of each successful forgot-password request per user.
 * If same user attempts more than once within the same calendar day, block and display warning.
 * Rate limit resets at midnight (00:00) of the next calendar day.
 */

const STORAGE_KEY = 'so_rate_limits';

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function hasUsedToday(feature, identifier) {
  const log = getLog();
  const key = `${feature}:${identifier}`;
  return log[key] === getTodayKey();
}

export function markUsedToday(feature, identifier) {
  const log = getLog();
  const key = `${feature}:${identifier}`;
  log[key] = getTodayKey();
  saveLog(log);
}

/**
 * Generic daily counter (for question posting, social posting, etc.)
 */
const COUNTER_KEY = 'so_daily_counters';

function getCounters() {
  try {
    const data = JSON.parse(localStorage.getItem(COUNTER_KEY)) || {};
    if (data._date !== getTodayKey()) {
      return { _date: getTodayKey() };
    }
    return data;
  } catch {
    return { _date: getTodayKey() };
  }
}

function saveCounters(counters) {
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
}

export function getDailyCount(feature, userId) {
  const counters = getCounters();
  const key = `${feature}:${userId}`;
  return counters[key] || 0;
}

export function incrementDailyCount(feature, userId) {
  const counters = getCounters();
  const key = `${feature}:${userId}`;
  counters[key] = (counters[key] || 0) + 1;
  saveCounters(counters);
  return counters[key];
}
