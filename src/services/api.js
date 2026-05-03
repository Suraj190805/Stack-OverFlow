// ── API Service Layer ───────────────────────────────────
// Centralized API client for all backend communication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ── Token Management ────────────────────────────────────

function getToken() {
  return localStorage.getItem('so_token');
}

function setToken(token) {
  localStorage.setItem('so_token', token);
}

function removeToken() {
  localStorage.removeItem('so_token');
}

// ── Base Fetch Wrapper ──────────────────────────────────

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — token expired or invalid
  // But NOT for auth endpoints where 401 means "wrong credentials"
  if (response.status === 401) {
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    if (!isAuthEndpoint) {
      removeToken();
      if (!['/login', '/register', '/forgot-password'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    const data = await response.json();
    throw new Error(data.error || 'Authentication required');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// ── Auth API ────────────────────────────────────────────

export const authAPI = {
  register: (userData) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (email, password, loginMeta = null) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, loginMeta }),
    }),

  getMe: () => apiFetch('/auth/me'),

  forgotPassword: (identifier) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  resetPassword: (identifier, newPassword) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, newPassword }),
    }),
};

// ── Users API ───────────────────────────────────────────

export const usersAPI = {
  getAll: () => apiFetch('/users'),

  getById: (id) => apiFetch(`/users/${id}`),

  update: (id, updates) =>
    apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  search: (query) => apiFetch(`/users/search?q=${encodeURIComponent(query)}`),

  addFriend: (targetId) =>
    apiFetch(`/users/${targetId}/friend`, { method: 'POST' }),

  removeFriend: (targetId) =>
    apiFetch(`/users/${targetId}/friend`, { method: 'DELETE' }),

  getLoginHistory: (userId) => apiFetch(`/users/${userId}/login-history`),
};

// ── Questions API ───────────────────────────────────────

export const questionsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.sort) query.set('sort', params.sort);
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    return apiFetch(`/questions?${query.toString()}`);
  },

  getById: (id) => apiFetch(`/questions/${id}`),

  create: (questionData) =>
    apiFetch('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),

  vote: (questionId, voteType) =>
    apiFetch(`/questions/${questionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }),

  toggleSave: (questionId) =>
    apiFetch(`/questions/${questionId}/save`, { method: 'POST' }),

  getUserSaves: () => apiFetch('/questions/user/saves'),

  getUserVotes: () => apiFetch('/questions/user/votes'),

  getTags: () => apiFetch('/questions/tags'),

  getBountiedCount: () => apiFetch('/questions/bountied-count'),
};

// ── Answers API ─────────────────────────────────────────

export const answersAPI = {
  getForQuestion: (questionId) => apiFetch(`/answers/question/${questionId}`),

  create: (questionId, body) =>
    apiFetch('/answers', {
      method: 'POST',
      body: JSON.stringify({ questionId, body }),
    }),

  delete: (answerId) =>
    apiFetch(`/answers/${answerId}`, { method: 'DELETE' }),

  vote: (answerId, voteType) =>
    apiFetch(`/answers/${answerId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }),
};

// ── Points API ──────────────────────────────────────────

export const pointsAPI = {
  getTransactions: () => apiFetch('/points/transactions'),

  transfer: (recipientId, amount) =>
    apiFetch('/points/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientId, amount }),
    }),
};

// ── Posts API ───────────────────────────────────────────

export const postsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return apiFetch(`/posts?${query.toString()}`);
  },

  create: (content, media = null, mediaType = null) =>
    apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, media, mediaType }),
    }),

  toggleLike: (postId) =>
    apiFetch(`/posts/${postId}/like`, { method: 'POST' }),

  addComment: (postId, text) =>
    apiFetch(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

// ── Exports ─────────────────────────────────────────────
export { getToken, setToken, removeToken };
