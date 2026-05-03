import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './RightSidebar.css';

const BLOG_POSTS = [
  "The messy truth of your AI strategies",
  "Gen Z needs a knowledge base (and so do you)",
];

const META_POSTS = [
  { icon: "📌", text: "Retiring the beta site", isNew: true },
  { icon: "📋", text: "Policy: Generative AI (e.g., ChatGPT) is banned" },
];

const HOT_META_POSTS = [
  { votes: 21, text: "What are the guidelines for accepting or closing \"Open Ended Questions\"?" },
  { votes: 14, text: "Should we burninate the [data] tag?" },
  { votes: 8, text: "How to handle questions about deprecated APIs?" },
];

const HOT_QUESTIONS = [
  "What is the difference between React and Vue?",
  "How to center a div in CSS?",
  "Best practices for async/await in Node.js",
  "Why does my useEffect cleanup function run?",
];

const DEFAULT_WATCHED = ["javascript", "react", "node.js", "css", "python"];
const DEFAULT_IGNORED = ["php", "jquery"];

export default function RightSidebar() {
  const { t } = useLanguage();
  const [watchedTags, setWatchedTags] = useState(DEFAULT_WATCHED);
  const [ignoredTags, setIgnoredTags] = useState(DEFAULT_IGNORED);
  const [showWatchInput, setShowWatchInput] = useState(false);
  const [showIgnoreInput, setShowIgnoreInput] = useState(false);
  const [watchInput, setWatchInput] = useState('');
  const [ignoreInput, setIgnoreInput] = useState('');

  const addWatchedTag = () => {
    const tag = watchInput.trim().toLowerCase();
    if (tag && !watchedTags.includes(tag)) {
      setWatchedTags(prev => [...prev, tag]);
    }
    setWatchInput('');
    setShowWatchInput(false);
  };

  const removeWatchedTag = (tag) => {
    setWatchedTags(prev => prev.filter(t => t !== tag));
  };

  const addIgnoredTag = () => {
    const tag = ignoreInput.trim().toLowerCase();
    if (tag && !ignoredTags.includes(tag)) {
      setIgnoredTags(prev => [...prev, tag]);
    }
    setIgnoreInput('');
    setShowIgnoreInput(false);
  };

  const removeIgnoredTag = (tag) => {
    setIgnoredTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <aside className="right-sidebar" id="right-sidebar">
      {/* Overflow Blog */}
      <div className="right-sidebar__widget right-sidebar__widget--yellow">
        <h4 className="right-sidebar__widget-title right-sidebar__widget-title--yellow">
          {t('rightSidebar.overflowBlog')}
        </h4>
        <ul className="right-sidebar__widget-list">
          {BLOG_POSTS.map((post, i) => (
            <li key={i} className="right-sidebar__widget-item">
              <span className="right-sidebar__widget-icon">✏️</span>
              <span>{post}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured on Meta */}
      <div className="right-sidebar__widget right-sidebar__widget--yellow">
        <h4 className="right-sidebar__widget-title right-sidebar__widget-title--yellow">
          {t('rightSidebar.featuredMeta')}
        </h4>
        <ul className="right-sidebar__widget-list">
          {META_POSTS.map((post, i) => (
            <li key={i} className="right-sidebar__widget-item">
              <span className="right-sidebar__widget-icon">{post.icon}</span>
              <span>{post.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hot Meta Posts */}
      <div className="right-sidebar__widget">
        <h4 className="right-sidebar__widget-title">
          {t('rightSidebar.hotMetaPosts')}
        </h4>
        <ul className="right-sidebar__widget-list">
          {HOT_META_POSTS.map((post, i) => (
            <li key={i} className="right-sidebar__widget-item right-sidebar__widget-item--meta">
              <span className="right-sidebar__meta-votes">{post.votes}</span>
              <Link to="/dashboard" className="right-sidebar__meta-link">{post.text}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Custom Filters */}
      <div className="right-sidebar__widget">
        <h4 className="right-sidebar__widget-title">
          {t('rightSidebar.customFilters')}
        </h4>
        <div className="right-sidebar__custom-filters">
          <Link to="/dashboard" className="right-sidebar__create-filter">
            {t('rightSidebar.createFilter')}
          </Link>
        </div>
      </div>

      {/* Hot Network Questions */}
      <div className="right-sidebar__widget">
        <h4 className="right-sidebar__widget-title">
          {t('rightSidebar.hotNetworkQuestions')}
        </h4>
        <ul className="right-sidebar__widget-list">
          {HOT_QUESTIONS.map((q, i) => (
            <li key={i} className="right-sidebar__widget-item right-sidebar__widget-item--link">
              <Link to="/dashboard">{q}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Watched Tags */}
      <div className="right-sidebar__widget">
        <h4 className="right-sidebar__widget-title">
          {t('rightSidebar.watchedTags')}
        </h4>
        <div className="right-sidebar__tags-section">
          {watchedTags.length > 0 ? (
            <div className="right-sidebar__tags">
              {watchedTags.map((tag) => (
                <span key={tag} className="s-tag right-sidebar__tag-removable">
                  {tag}
                  <button
                    className="right-sidebar__tag-remove"
                    onClick={() => removeWatchedTag(tag)}
                    title="Remove tag"
                  >×</button>
                </span>
              ))}
            </div>
          ) : (
            <div className="right-sidebar__tags-empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#D6D9DC" strokeWidth="2" fill="none"/>
                <path d="M18 30 C18 26, 22 22, 30 18" stroke="#D6D9DC" strokeWidth="2" fill="none"/>
              </svg>
              <p>{t('rightSidebar.watchTagsHint')}</p>
            </div>
          )}
          {showWatchInput ? (
            <div className="right-sidebar__tag-input-row">
              <input
                type="text"
                className="form-input right-sidebar__tag-input"
                placeholder="e.g. typescript"
                value={watchInput}
                onChange={e => setWatchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWatchedTag()}
                autoFocus
              />
              <button className="btn btn--primary btn--sm" onClick={addWatchedTag}>{t('rightSidebar.add')}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => { setShowWatchInput(false); setWatchInput(''); }}>{t('rightSidebar.cancel')}</button>
            </div>
          ) : (
            <button
              className="btn btn--outlined btn--sm right-sidebar__watch-btn"
              onClick={() => setShowWatchInput(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6Zm0 10.5A4.5 4.5 0 1 1 7 2.5a4.5 4.5 0 0 1 0 9ZM7 4C5.3 4 4 5.3 4 7s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3Z" fill="currentColor"/></svg>
              {t('rightSidebar.watchTag')}
            </button>
          )}
        </div>
      </div>

      {/* Ignored Tags */}
      <div className="right-sidebar__widget">
        <h4 className="right-sidebar__widget-title">
          {t('rightSidebar.ignoredTags')}
        </h4>
        <div className="right-sidebar__tags-section">
          {ignoredTags.length > 0 ? (
            <div className="right-sidebar__tags">
              {ignoredTags.map((tag) => (
                <span key={tag} className="s-tag right-sidebar__tag-removable right-sidebar__tag--ignored">
                  {tag}
                  <button
                    className="right-sidebar__tag-remove"
                    onClick={() => removeIgnoredTag(tag)}
                    title="Remove tag"
                  >×</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="right-sidebar__tags-empty-text">{t('rightSidebar.noIgnoredTags')}</p>
          )}
          {showIgnoreInput ? (
            <div className="right-sidebar__tag-input-row">
              <input
                type="text"
                className="form-input right-sidebar__tag-input"
                placeholder="e.g. jquery"
                value={ignoreInput}
                onChange={e => setIgnoreInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIgnoredTag()}
                autoFocus
              />
              <button className="btn btn--primary btn--sm" onClick={addIgnoredTag}>{t('rightSidebar.add')}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => { setShowIgnoreInput(false); setIgnoreInput(''); }}>{t('rightSidebar.cancel')}</button>
            </div>
          ) : (
            <button
              className="btn btn--ghost btn--sm right-sidebar__watch-btn"
              onClick={() => setShowIgnoreInput(true)}
            >
              {t('rightSidebar.addIgnoredTag')}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
