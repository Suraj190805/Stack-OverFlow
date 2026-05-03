import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './LeftSidebar.css';

export default function LeftSidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="left-sidebar" id="left-sidebar">
      <ol className="left-sidebar__nav">
        <li>
          <Link to="/home" className={`left-sidebar__item ${isActive('/home') ? 'left-sidebar__item--active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M15 2V1H3v1H0v4c0 1.6 1.4 3 3 3v1c.4 1.5 3 2.6 5 3v2H5s-1 1.5-1 2h10c0-.4-1-2-1-2h-3v-2c2-.4 4.6-1.5 5-3V8c1.6-.2 3-1.4 3-3V2h-3ZM3 7c-.5 0-1-.5-1-1V4h1v3Zm8.4 2.5L9 8 6.6 9.4l1-2.7L5 5h3l1-3 1 3h3l-2.6 1.7 1 2.7ZM16 6c0 .5-.5 1-1 1V4h1v2Z" fill="currentColor"/></svg>
            {t('sidebar.home')}
          </Link>
        </li>
        <li>
          <Link to="/ai-assist" className={`left-sidebar__item ${isActive('/ai-assist') ? 'left-sidebar__item--active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2l1.5 3.5L14 7l-3 2.5.8 3.5L9 11.2 6.2 13l.8-3.5L4 7l3.5-1.5L9 2Z" fill="currentColor"/></svg>
            {t('sidebar.aiAssist')}
          </Link>
        </li>
        <li>
          <Link to="/dashboard" className={`left-sidebar__item ${isActive('/dashboard') || isActive('/ask') ? 'left-sidebar__item--active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm4 9h-3v3H8v-3H5V8h3V5h2v3h3v2Z" fill="currentColor"/></svg>
            {t('sidebar.questions')}
          </Link>
        </li>
        <li>
          <Link to="/social" className={`left-sidebar__item ${isActive('/social') ? 'left-sidebar__item--active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M1 6c0-.6.4-1 1-1h14c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H7l-4 2v-2H2c-.6 0-1-.4-1-1V6Zm2 1v6h2v1l2-1h7V7H3Z" fill="currentColor"/></svg>
            {t('sidebar.social')}
          </Link>
        </li>
        <li>
          <Link to="/challenges" className={`left-sidebar__item ${isActive('/challenges') ? 'left-sidebar__item--active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm4.4 5.4-5 5a.8.8 0 0 1-1.1 0l-2.7-2.7a.8.8 0 1 1 1.1-1.1L8 9.9l4.4-4.4a.8.8 0 1 1 1.1 1.1Z" fill="currentColor"/></svg>
            {t('sidebar.challenges')}
          </Link>
        </li>
      </ol>

      <div className="left-sidebar__section">
        <div className="left-sidebar__section-title">{t('sidebar.public')}</div>
        <ol className="left-sidebar__nav">
          <li>
            <Link to="/tags" className={`left-sidebar__item ${isActive('/tags') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.5 13H8v-1h1.5v1Zm1.6-5.5-.7.7c-.6.6-1 1-1 2.3H8c0-1.7.7-2.4 1.3-3l.8-.8c.3-.3.4-.7.4-1.2 0-1.1-.9-2-2-2s-2 .9-2 2H5c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .9-.3 1.7-1 2.3L11.1 8.5Z" fill="currentColor"/></svg>
              {t('sidebar.tags')}
            </Link>
          </li>
          <li>
            <Link to="/saves" className={`left-sidebar__item ${isActive('/saves') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 1h12c.6 0 1 .4 1 1v14.4a.5.5 0 0 1-.8.4L9 13.2l-6.2 3.6a.5.5 0 0 1-.8-.4V2c0-.6.4-1 1-1Z" fill="currentColor"/></svg>
              {t('sidebar.saves')}
            </Link>
          </li>
          <li>
            <Link to="/rewards" className={`left-sidebar__item ${isActive('/rewards') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm3.7 11-3.7-2.2L5.3 12l1-4.2L3 5.3l4.3-.4L9 1l1.7 3.9 4.3.4-3.3 2.5 1 4.2Z" fill="currentColor"/></svg>
              {t('sidebar.rewards')}
            </Link>
          </li>
          <li>
            <Link to="/users" className={`left-sidebar__item ${isActive('/users') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1ZM5 14.9A5 5 0 0 1 9 3a5 5 0 0 1 4 11.9v-.7c0-.8-.3-1.5-.8-2-.6-.5-1.3-.8-2.5-.8H8.3c-1.2 0-1.9.3-2.5.8-.5.5-.8 1.2-.8 2v.7Z" fill="currentColor"/><circle cx="9" cy="7" r="2.5" fill="currentColor"/></svg>
              {t('sidebar.users')}
            </Link>
          </li>
          <li>
            <Link to="/companies" className={`left-sidebar__item ${isActive('/companies') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 3h6v14H2V3Zm8 4h6v10h-6V7ZM4 5v2h2V5H4Zm0 4v2h2V9H4Zm0 4v2h2v-2H4Zm8-4v2h2V9h-2Zm0 4v2h2v-2h-2Z" fill="currentColor"/></svg>
              {t('sidebar.companies')}
            </Link>
          </li>
          <li>
            <Link to="/subscription" className={`left-sidebar__item ${isActive('/subscription') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M15 1H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 14H3V3h12v12ZM5 9h8v2H5V9Zm0 4h4v2H5v-2Zm0-8h8v2H5V5Z" fill="currentColor"/></svg>
              {t('sidebar.subscription')}
            </Link>
          </li>
        </ol>
      </div>

      <div className="left-sidebar__section">
        <div className="left-sidebar__section-title">{t('sidebar.collectives')}</div>
        <ol className="left-sidebar__nav">
          <li>
            <Link to="/collectives" className={`left-sidebar__item left-sidebar__item--subtle ${isActive('/collectives') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm-.75-3h1.5v1.5h-1.5v-1.5Zm0-8h1.5v6h-1.5v-6Z" fill="currentColor"/></svg>
              {t('sidebar.exploreCollectives')}
            </Link>
          </li>
        </ol>
      </div>

      <div className="left-sidebar__section">
        <div className="left-sidebar__section-title">{t('sidebar.account')}</div>
        <ol className="left-sidebar__nav">
          <li>
            <Link to="/profile" className={`left-sidebar__item ${isActive('/profile') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1ZM5 14.9A5 5 0 0 1 9 3a5 5 0 0 1 4 11.9v-.7c0-.8-.3-1.5-.8-2-.6-.5-1.3-.8-2.5-.8H8.3c-1.2 0-1.9.3-2.5.8-.5.5-.8 1.2-.8 2v.7Z" fill="currentColor"/><circle cx="9" cy="7" r="2.5" fill="currentColor"/></svg>
              {t('sidebar.profile')}
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`left-sidebar__item ${isActive('/settings') ? 'left-sidebar__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="m15.1 7.1-.9-.3c-.1-.3-.2-.6-.4-.9l.5-.8c.2-.4.2-.8-.1-1.1l-1.2-1.2c-.3-.3-.7-.3-1.1-.1l-.8.5c-.3-.2-.6-.3-.9-.4L10 2.2C9.9 1.8 9.5 1.5 9.1 1.5h-1.7c-.4 0-.8.3-.9.7l-.3.9c-.3.1-.6.2-.9.4l-.8-.5c-.4-.2-.8-.2-1.1.1L2.2 4.3c-.3.3-.3.7-.1 1.1l.5.8c-.2.3-.3.6-.4.9l-.9.3c-.4.1-.7.5-.7.9v1.7c0 .4.3.8.7.9l.9.3c.1.3.2.6.4.9l-.5.8c-.2.4-.2.8.1 1.1l1.2 1.2c.3.3.7.3 1.1.1l.8-.5c.3.2.6.3.9.4l.3.9c.1.4.5.7.9.7h1.7c.4 0 .8-.3.9-.7l.3-.9c.3-.1.6-.2.9-.4l.8.5c.4.2.8.2 1.1-.1l1.2-1.2c.3-.3.3-.7.1-1.1l-.5-.8c.2-.3.3-.6.4-.9l.9-.3c.4-.1.7-.5.7-.9V8c0-.4-.3-.8-.7-.9ZM8.2 11.3c-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1-1.4 3.1-3.1 3.1Z" fill="currentColor"/></svg>
              {t('sidebar.settings')}
            </Link>
          </li>
        </ol>
      </div>
    </nav>
  );
}
