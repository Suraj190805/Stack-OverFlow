import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_QUESTIONS } from '../data/mockUsers';
import './Home.css';

// Sidebar data
const OVERFLOW_BLOG = [
  { icon: '🏷️', text: 'Your LLM issues are really data issues' },
  { icon: '🏷️', text: 'The Worst Coder in the World goes agentic: building a leaderboard cracking AI' },
];
const FEATURED_META = [
  { icon: '☐', text: '(Almost) One year of Challenges' },
  { icon: '🔴', text: 'Policy: Generative AI (e.g., ChatGPT) is banned' },
];
const HOT_META = [
  { votes: 21, text: 'Why is the user homepage so unhelpful for people looking to answer questions?' },
  { votes: 14, text: 'Why was this question about favicons closed?' },
  { votes: 8, text: 'Is the "beta site" still online and prominently linked to a month after...' },
];

export default function Home() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [aiQuery, setAiQuery] = useState('');
  const [watchedTags, setWatchedTags] = useLocalStorage('so_watched_tags', ['javascript', 'react', 'python']);

  const questions = useMemo(() => {
    try {
      const saved = localStorage.getItem('so_questions');
      return saved ? JSON.parse(saved) : MOCK_QUESTIONS;
    } catch { return MOCK_QUESTIONS; }
  }, []);

  const interestingPosts = useMemo(() => {
    const sorted = [...questions].sort((a, b) => b.votes - a.votes);
    return sorted.slice(0, 8);
  }, [questions]);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const navigate = useNavigate();

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) {
      navigate('/ai-assist');
      return;
    }
    navigate(`/ai-assist?q=${encodeURIComponent(aiQuery.trim())}`);
    setAiQuery('');
  };

  const userName = currentUser?.displayName?.split(' ')[0] || 'User';
  const repBars = [4, 8, 2, 12, 6, 15, 3, 10, 7, 5, 9, 14, 6, 11, 8];

  return (
    <div className="home-layout" id="home-page">
      <div className="home-main">
        {/* AI Assist Banner */}
        <div className="home-ai-banner">
          <div className="home-ai-banner__heading">
            <div className="home-ai-banner__icon">✦</div>
            <h1 className="home-ai-banner__title">{t('home.greeting', { name: userName })}</h1>
          </div>
          <p className="home-ai-banner__subtitle">{t('home.aiSubtitle')}</p>
          <div className="home-ai-banner__input-wrap">
            <input
              className="home-ai-banner__input"
              type="text"
              placeholder={t('home.startChat')}
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
            />
            <button className="home-ai-banner__send" onClick={handleAiSubmit}>↑</button>
          </div>
          <p className="home-ai-banner__disclaimer">
            {t('home.termsAgree')}{' '}
            <a href="#" onClick={e => e.preventDefault()}>{t('home.termsOfService')}</a> {t('home.and')}{' '}
            <a href="#" onClick={e => e.preventDefault()}>{t('home.privacyPolicy')}</a>.{' '}
            {t('home.poweredBy')}
          </p>
        </div>

        {/* Stat Cards Row */}
        <div className="home-stats">
          <div className="home-stat-card">
            <div className="home-stat-card__header">
              <span className="home-stat-card__title">{t('home.reputation')}</span>
              <button className="home-stat-card__gear">⚙</button>
            </div>
            <div className="home-stat-card__rep-row">
              <span className="home-stat-card__rep-value">{currentUser?.points || 1}</span>
              <div className="home-stat-card__rep-chart">
                {repBars.map((h, i) => (
                  <div key={i} className="home-stat-card__rep-bar" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
            </div>
            <span className="home-stat-card__rep-text">
              {t('home.earnReputation')}{' '}
              <Link to="/dashboard">{t('home.asking')}</Link>,{' '}
              <Link to="/dashboard">{t('home.answering')}</Link> &{' '}
              <Link to="/dashboard">{t('home.editing')}</Link>.
            </span>
          </div>

          <div className="home-stat-card">
            <div className="home-stat-card__header">
              <span className="home-stat-card__title">{t('home.badgeProgress')}</span>
              <button className="home-stat-card__gear">⚙</button>
            </div>
            <div className="home-stat-card__badge">
              <div className="home-stat-card__badge-icon home-stat-card__badge-icon--bronze">●</div>
              <span className="home-stat-card__badge-name">{t('home.informed')}</span>
            </div>
            <span className="home-stat-card__badge-text">{t('home.readTour')}</span>
          </div>

          <div className="home-stat-card">
            <div className="home-stat-card__header">
              <span className="home-stat-card__title">{t('home.watchedTags')}</span>
              <button className="home-stat-card__gear">⚙</button>
            </div>
            {watchedTags.length > 0 ? (
              <>
                <div className="home-stat-card__watched-tags">
                  {watchedTags.map(tag => (
                    <span key={tag} className="s-tag">{tag}</span>
                  ))}
                </div>
                <button className="home-stat-card__customize-btn" onClick={() => toast.info(t('home.tagCustomSoon'))}>
                  {t('home.customizeFeed')}
                </button>
              </>
            ) : (
              <>
                <p className="home-stat-card__watched-empty">{t('home.notWatchingTags')}</p>
                <button className="home-stat-card__customize-btn" onClick={() => toast.info(t('home.tagCustomSoon'))}>
                  {t('home.customizeFeed')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Interesting Posts */}
        <div className="home-posts">
          <div className="home-posts__header">
            <h2 className="home-posts__title">{t('home.interestingPosts')}</h2>
            <button className="home-posts__customize" onClick={() => toast.info(t('home.feedCustomSoon'))}>
              {t('home.customizeFeed')}
            </button>
          </div>
          <p className="home-posts__subtitle">{t('home.basedOnHistory')}</p>

          {interestingPosts.map((q, idx) => {
            const answerCount = q.answers?.length || 0;
            const hasAccepted = answerCount > 0;
            return (
              <div className="home-post" key={q.id} style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="home-post__stats">
                  <span className="home-post__stat">{q.votes} {q.votes === 1 ? t('home.vote') : t('home.votes')}</span>
                  <span className={`home-post__stat ${answerCount > 0 ? (hasAccepted ? 'home-post__stat--answers-filled' : 'home-post__stat--answers') : ''}`}>
                    {answerCount} {answerCount === 1 ? t('home.answer') : t('home.answers')}
                  </span>
                  <span className="home-post__stat">{formatCount(q.views)} {t('home.views')}</span>
                </div>
                <div className="home-post__content">
                  <Link to="/dashboard" className="home-post__title">{q.title}</Link>
                  <p className="home-post__excerpt">{q.body}</p>
                  <div className="home-post__meta">
                    <div className="home-post__tags">
                      {q.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="s-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="home-post__author">
                      <div className="home-post__author-avatar">
                        {(q.authorName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="home-post__author-name">{q.authorName || 'User'}</span>
                      <span className="home-post__author-rep">{formatCount(q.authorRep || 1)}</span>
                      <span>{q.askedAt ? getTimeAgo(q.askedAt) : 'recently'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="home-sidebar">
        <div className="home-widget">
          <div className="home-widget__header">{t('home.overflowBlog')}</div>
          <ul className="home-widget__list">
            {OVERFLOW_BLOG.map((item, i) => (
              <li key={i} className="home-widget__item">
                <span className="home-widget__item-icon">{item.icon}</span>
                <span className="home-widget__item-link">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="home-widget">
          <div className="home-widget__header">{t('home.featuredMeta')}</div>
          <ul className="home-widget__list">
            {FEATURED_META.map((item, i) => (
              <li key={i} className="home-widget__item">
                <span className="home-widget__item-icon">{item.icon}</span>
                <span className="home-widget__item-link">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="home-widget">
          <div className="home-widget__header">{t('home.hotMetaPosts')}</div>
          <ul className="home-widget__list">
            {HOT_META.map((item, i) => (
              <li key={i} className="home-widget__item">
                <span className="home-widget__meta-votes">{item.votes}</span>
                <span className="home-widget__item-link">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
