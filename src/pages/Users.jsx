import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usersAPI } from '../services/api';
import './Users.css';

// Avatar color palette
const AVATAR_COLORS = [
  '#E64A19', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#1E88E5', '#00897B', '#43A047', '#7CB342', '#F4511E',
  '#6D4C41', '#546E7A', '#EC407A', '#AB47BC', '#42A5F5',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TABS = [
  { id: 'reputation', label: 'Reputation' },
  { id: 'new', label: 'New users' },
  { id: 'voters', label: 'Voters' },
  { id: 'editors', label: 'Editors' },
  { id: 'moderators', label: 'Moderators' },
];

const TIME_RANGES = [
  { id: 'week', label: 'week' },
  { id: 'month', label: 'month' },
  { id: 'quarter', label: 'quarter' },
  { id: 'year', label: 'year' },
  { id: 'all', label: 'all' },
];

export default function Users() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('reputation');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await usersAPI.getAll();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (!currentUser) return <Navigate to="/login" />;

  // Filter by search
  const filtered = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.displayName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    // Sort based on active tab
    if (activeTab === 'reputation') {
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else if (activeTab === 'new') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [users, search, activeTab]);

  return (
    <div className="users-page">
      <h1 className="users-page__title">{t('users.title')}</h1>

      {/* Controls */}
      <div className="users-page__controls">
        {/* Search */}
        <div className="users-page__search">
          <svg className="users-page__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="users-page__search-input"
            placeholder={t('users.filterPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="users-page__tabs">
          {[
            { id: 'reputation', label: t('users.reputation') },
            { id: 'new', label: t('users.newUsers') },
            { id: 'voters', label: t('users.voters') },
            { id: 'editors', label: t('users.editors') },
            { id: 'moderators', label: t('users.moderators') },
          ].map(tab => (
            <button
              key={tab.id}
              className={`users-page__tab ${activeTab === tab.id ? 'users-page__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="users-page__time-range">
        {[
          { id: 'week', label: t('users.week') },
          { id: 'month', label: t('users.month') },
          { id: 'quarter', label: t('users.quarter') },
          { id: 'year', label: t('users.year') },
          { id: 'all', label: t('users.all') },
        ].map(tr => (
          <button
            key={tr.id}
            className={`users-page__time-btn ${timeRange === tr.id ? 'users-page__time-btn--active' : ''}`}
            onClick={() => setTimeRange(tr.id)}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="users-page__loading">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="users-page__empty">
          {search ? t('users.noResultsMatching', { query: search }) : t('users.noResults')}
        </div>
      ) : (
        <div className="users-grid">
          {filtered.map(user => (
            <div key={user._id} className="user-card">
              {/* Avatar */}
              <div
                className="user-card__avatar"
                style={{ background: getAvatarColor(user.displayName || user.username) }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} />
                ) : (
                  (user.displayName || user.username || '?').charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="user-card__info">
                <a className="user-card__name" href="#" onClick={(e) => e.preventDefault()}>
                  {user.displayName || user.username}
                </a>
                {user.email && (
                  <span className="user-card__location">
                    {user.email.split('@')[1]?.replace('.com', '').replace('.', ' ')}
                  </span>
                )}
                <span className="user-card__rep">
                  {(user.points || 0).toLocaleString()}
                </span>
                {/* Tags */}
                <div className="user-card__tags">
                  {(user.plan === 'gold' ? ['javascript', 'react', 'node.js'] :
                    user.plan === 'silver' ? ['python', 'css', 'html'] :
                    ['javascript', 'css']
                  ).slice(0, 3).map(tag => (
                    <span key={tag} className="user-card__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
