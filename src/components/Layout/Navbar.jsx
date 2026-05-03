import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePoints } from '../../contexts/PointsContext';
import SOLogo from '../common/SOLogo';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState(null); // 'inbox' | 'achievements' | 'help' | 'community' | null
  const [communitySearch, setCommunitySearch] = useState('');
  const dropdownRef = useRef(null);
  const panelRef = useRef(null);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // Get points context only when user is logged in
  let transactions = [];
  try {
    const pointsCtx = usePoints();
    if (currentUser && pointsCtx) {
      transactions = pointsCtx.getUserTransactions(currentUser.id);
    }
  } catch {
    // PointsContext not available
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActivePanel(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
    setMenuOpen(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return '🟢';
      case 'deducted': return '🔴';
      case 'transferred': return '🔵';
      case 'received': return '🟡';
      default: return '⚪';
    }
  };

  // Generate inbox items from transactions
  const inboxItems = transactions.slice(0, 8).map(tx => ({
    id: tx.id,
    icon: getTransactionIcon(tx.type),
    text: tx.details,
    time: timeAgo(tx.timestamp),
    type: tx.type,
  }));

  // Recent achievements from earned transactions
  const achievements = transactions
    .filter(tx => tx.type === 'earned' || tx.type === 'received')
    .slice(0, 6)
    .map(tx => ({
      id: tx.id,
      text: tx.details,
      points: `+${tx.amount}`,
      time: timeAgo(tx.timestamp),
    }));

  const totalEarned = transactions
    .filter(tx => tx.type === 'earned' || tx.type === 'received')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Stack Exchange communities data
  const stackExchangeCommunities = [
    { name: '3D Printing', desc: 'For 3D printing enthusiasts', icon: '🖨️', url: 'https://3dprinting.stackexchange.com' },
    { name: 'Academia', desc: 'For academics and those enrolled in higher education', icon: '🎓', url: 'https://academia.stackexchange.com' },
    { name: 'Amateur Radio', desc: 'For amateur radio enthusiasts', icon: '📻', url: 'https://ham.stackexchange.com' },
    { name: 'Android Enthusiasts', desc: 'For enthusiasts and power users of the Android OS', icon: '🤖', url: 'https://android.stackexchange.com' },
    { name: 'Anime & Manga', desc: 'For anime and manga fans', icon: '🎌', url: 'https://anime.stackexchange.com' },
    { name: 'Arduino', desc: 'For developers of open-source hardware and software', icon: '🔌', url: 'https://arduino.stackexchange.com' },
    { name: 'Ask Different', desc: 'For power users of Apple hardware and software', icon: '🍎', url: 'https://apple.stackexchange.com' },
    { name: 'Ask Ubuntu', desc: 'For Ubuntu users and developers', icon: '🐧', url: 'https://askubuntu.com' },
    { name: 'Astronomy', desc: 'For astronomers and astrophysicists', icon: '🔭', url: 'https://astronomy.stackexchange.com' },
    { name: 'Aviation', desc: 'For aircraft pilots, mechanics, and enthusiasts', icon: '✈️', url: 'https://aviation.stackexchange.com' },
    { name: 'Biology', desc: 'For biology researchers, academics, and students', icon: '🧬', url: 'https://biology.stackexchange.com' },
    { name: 'Bitcoin', desc: 'For Bitcoin crypto-currency enthusiasts', icon: '₿', url: 'https://bitcoin.stackexchange.com' },
    { name: 'Blender', desc: 'For people who use Blender', icon: '🎨', url: 'https://blender.stackexchange.com' },
    { name: 'Chemistry', desc: 'For scientists, academics, teachers and students', icon: '⚗️', url: 'https://chemistry.stackexchange.com' },
    { name: 'Code Review', desc: 'For peer programmer code reviews', icon: '👀', url: 'https://codereview.stackexchange.com' },
    { name: 'Cooking', desc: 'For professional and amateur chefs', icon: '🍳', url: 'https://cooking.stackexchange.com' },
    { name: 'Cross Validated', desc: 'For statistics, machine learning, and data analysis', icon: '📊', url: 'https://stats.stackexchange.com' },
    { name: 'Cryptography', desc: 'For software developers and mathematicians', icon: '🔐', url: 'https://crypto.stackexchange.com' },
    { name: 'Data Science', desc: 'For data science professionals', icon: '📈', url: 'https://datascience.stackexchange.com' },
    { name: 'Database Administrators', desc: 'For database professionals', icon: '🗄️', url: 'https://dba.stackexchange.com' },
    { name: 'DevOps', desc: 'For software engineers working on automated testing', icon: '⚙️', url: 'https://devops.stackexchange.com' },
    { name: 'Electrical Engineering', desc: 'For electronics and electrical engineering professionals', icon: '⚡', url: 'https://electronics.stackexchange.com' },
    { name: 'English Language & Usage', desc: 'For linguists and English language enthusiasts', icon: '📝', url: 'https://english.stackexchange.com' },
    { name: 'Game Development', desc: 'For professional and independent game developers', icon: '🎮', url: 'https://gamedev.stackexchange.com' },
    { name: 'Geographic Information Systems', desc: 'For cartographers, geographers, and GIS professionals', icon: '🗺️', url: 'https://gis.stackexchange.com' },
    { name: 'Graphic Design', desc: 'For Graphic Design professionals', icon: '🎯', url: 'https://graphicdesign.stackexchange.com' },
    { name: 'Information Security', desc: 'For information security professionals', icon: '🛡️', url: 'https://security.stackexchange.com' },
    { name: 'Mathematics', desc: 'For people studying math at any level', icon: '🔢', url: 'https://math.stackexchange.com' },
    { name: 'Music', desc: 'For musicians, students, and enthusiasts', icon: '🎵', url: 'https://music.stackexchange.com' },
    { name: 'Network Engineering', desc: 'For network engineers', icon: '🌐', url: 'https://networkengineering.stackexchange.com' },
    { name: 'Photography', desc: 'For professional, enthusiast and amateur photographers', icon: '📷', url: 'https://photo.stackexchange.com' },
    { name: 'Physics', desc: 'For active researchers, academics and students of physics', icon: '⚛️', url: 'https://physics.stackexchange.com' },
    { name: 'Raspberry Pi', desc: 'For users and developers of hardware and software for Raspberry Pi', icon: '🍓', url: 'https://raspberrypi.stackexchange.com' },
    { name: 'Robotics', desc: 'For professional robotic engineers', icon: '🤖', url: 'https://robotics.stackexchange.com' },
    { name: 'Server Fault', desc: 'For system and network administrators', icon: '🖥️', url: 'https://serverfault.com' },
    { name: 'Software Engineering', desc: 'For professionals and students in software development', icon: '💻', url: 'https://softwareengineering.stackexchange.com' },
    { name: 'Sound Design', desc: 'For sound engineers and enthusiasts', icon: '🔊', url: 'https://sound.stackexchange.com' },
    { name: 'Space Exploration', desc: 'For spacecraft operators and scientists', icon: '🚀', url: 'https://space.stackexchange.com' },
    { name: 'Super User', desc: 'For computer enthusiasts and power users', icon: '🖱️', url: 'https://superuser.com' },
    { name: 'TeX - LaTeX', desc: 'For users of TeX, LaTeX, ConTeXt, and related systems', icon: '📄', url: 'https://tex.stackexchange.com' },
    { name: 'Unix & Linux', desc: 'For users of Linux, FreeBSD and other Un*x-like systems', icon: '🐧', url: 'https://unix.stackexchange.com' },
    { name: 'User Experience', desc: 'For user experience researchers and experts', icon: '🎨', url: 'https://ux.stackexchange.com' },
    { name: 'Web Applications', desc: 'For power users of web applications', icon: '🌍', url: 'https://webapps.stackexchange.com' },
    { name: 'WordPress Development', desc: 'For WordPress developers and administrators', icon: '📰', url: 'https://wordpress.stackexchange.com' },
  ];

  const filteredCommunities = stackExchangeCommunities.filter(c =>
    c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
    c.desc.toLowerCase().includes(communitySearch.toLowerCase())
  );

  // Navbar always visible — shows Login/Sign up for guests, user menu for logged-in

  return (
    <header className="so-header" id="navbar">
      <div className="so-header__topbar" />
      <div className="so-header__inner">
        {/* Logo */}
        <Link to={currentUser ? '/dashboard' : '/login'} className="so-header__logo" id="logo-link">
          <SOLogo size={25} />
          <span className="so-header__logo-text">
            stack<strong>overflow</strong>
          </span>
        </Link>

        {/* Nav Links */}
        {currentUser && (
          <nav className="so-header__nav">
            <Link to="/dashboard" className="so-header__nav-link">Products</Link>
          </nav>
        )}

        {/* Search */}
        <div className="so-header__search">
          <svg className="so-header__search-icon" width="18" height="18" viewBox="0 0 18 18">
            <path d="m18 16.5-5.14-5.18h-.35a7 7 0 1 0-1.19 1.19v.35L16.5 18l1.5-1.5ZM12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="so-header__search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="so-header__actions">
          {currentUser ? (
            <>
              {/* User Avatar + Rep */}
              <div className="so-header__user-menu" ref={dropdownRef}>
                <button className="so-header__avatar-btn" id="user-menu-btn" onClick={() => { setMenuOpen(!menuOpen); setActivePanel(null); }}>
                  <div className="so-header__avatar">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="" className="so-header__avatar-img" />
                    ) : (
                      currentUser.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="so-header__rep">{currentUser.points}</span>
                </button>

                {/* Dropdown */}
                <div className={`so-header__dropdown ${menuOpen ? 'so-header__dropdown--open' : ''}`}>
                  <div className="so-header__dropdown-header">
                    <strong>{currentUser.displayName}</strong>
                    <span>@{currentUser.username}</span>
                  </div>
                  <hr className="so-header__dropdown-divider" />
                  <Link to="/profile" className="so-header__dropdown-item">Profile</Link>
                  <Link to="/settings" className="so-header__dropdown-item">Settings</Link>
                  <Link to="/rewards" className="so-header__dropdown-item">Rewards & Points</Link>
                  <Link to="/subscription" className="so-header__dropdown-item">Subscription</Link>
                  <hr className="so-header__dropdown-divider" />
                  <button className="so-header__dropdown-item so-header__dropdown-item--danger" onClick={handleLogout}>Log out</button>
                </div>
              </div>

              {/* Icon buttons with panels */}
              <div className="so-header__panels-wrapper" ref={panelRef}>
                {/* Inbox */}
                <button
                  className={`so-header__icon-btn ${activePanel === 'inbox' ? 'so-header__icon-btn--active' : ''}`}
                  title="Inbox"
                  onClick={() => togglePanel('inbox')}
                  id="btn-inbox"
                >
                  <svg width="20" height="18" viewBox="0 0 20 18"><path d="M4.63 1h10.56a2 2 0 0 1 1.94 1.35L20 10.79V15a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-4.21l2.78-8.44c.25-.8 1-1.36 1.85-1.35Zm3.03 6.63 2.15 2.25 2.16-2.25H14v3.37H6V7.63h1.66Z" fill="currentColor"/></svg>
                  {inboxItems.length > 0 && <span className="so-header__icon-badge">{Math.min(inboxItems.length, 9)}{inboxItems.length > 9 ? '+' : ''}</span>}
                </button>

                {/* Achievements */}
                <button
                  className={`so-header__icon-btn ${activePanel === 'achievements' ? 'so-header__icon-btn--active' : ''}`}
                  title="Achievements"
                  onClick={() => togglePanel('achievements')}
                  id="btn-achievements"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M15 2V1H3v1H0v4c0 1.6 1.4 3 3 3v1c.4 1.5 3 2.6 5 3v2H5s-1 1.5-1 2h10c0-.4-1-2-1-2h-3v-2c2-.4 4.6-1.5 5-3V8c1.6-.2 3-1.4 3-3V2h-3ZM3 7c-.5 0-1-.5-1-1V4h1v3Zm13-1c0 .5-.5 1-1 1V4h1v2Z" fill="currentColor"/></svg>
                  {totalEarned > 0 && <span className="so-header__icon-badge so-header__icon-badge--green">✓</span>}
                </button>

                {/* Help */}
                <button
                  className={`so-header__icon-btn ${activePanel === 'help' ? 'so-header__icon-btn--active' : ''}`}
                  title="Help"
                  onClick={() => togglePanel('help')}
                  id="btn-help"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.5 13H8v-1h1.5v1Zm1.6-5.5-.7.7c-.6.6-1 1-1 2.3H8c0-1.7.7-2.4 1.3-3l.8-.8A2.2 2.2 0 0 0 10.5 6c0-1.1-.9-2-2-2S6.5 4.9 6.5 6H5c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .9-.4 1.7-.9 2.5Z" fill="currentColor"/></svg>
                </button>

                {/* Theme Toggle */}
                <button
                  className="theme-toggle"
                  onClick={toggleTheme}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  id="btn-theme-toggle"
                  aria-label="Toggle theme"
                >
                  <div className="theme-toggle__track">
                    <div className="theme-toggle__thumb">
                      <span className="theme-toggle__sun">☀️</span>
                      <span className="theme-toggle__moon">🌙</span>
                    </div>
                  </div>
                </button>

                {/* Community Switcher */}
                <button
                  className={`so-header__icon-btn ${activePanel === 'community' ? 'so-header__icon-btn--active' : ''}`}
                  title="A list of all Stack Exchange sites"
                  onClick={() => { togglePanel('community'); setCommunitySearch(''); }}
                  id="btn-community"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 4h2v2H3V4Zm0 4h2v2H3V8Zm0 4h2v2H3v-2Zm4-8h2v2H7V4Zm0 4h2v2H7V8Zm0 4h2v2H7v-2Zm4-8h2v2h-2V4Zm0 4h2v2h-2V8Zm0 4h2v2h-2v-2Z" fill="currentColor"/></svg>
                </button>

                {/* ===== INBOX PANEL ===== */}
                {activePanel === 'inbox' && (
                  <div className="so-header__panel so-header__panel--inbox">
                    <div className="so-header__panel-header">
                      <h3>Inbox</h3>
                      <span className="so-header__panel-count">{inboxItems.length} notifications</span>
                    </div>
                    <div className="so-header__panel-body">
                      {inboxItems.length === 0 ? (
                        <div className="so-header__panel-empty">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="#D1D5DB" strokeWidth="2" fill="none"/><path d="M8 16l16 10 16-10" stroke="#D1D5DB" strokeWidth="2" fill="none"/></svg>
                          <p>You're all caught up!</p>
                          <span>No new notifications</span>
                        </div>
                      ) : (
                        inboxItems.map(item => (
                          <div key={item.id} className="so-header__panel-item">
                            <span className="so-header__panel-item-icon">{item.icon}</span>
                            <div className="so-header__panel-item-content">
                              <span className="so-header__panel-item-text">{item.text}</span>
                              <span className="so-header__panel-item-time">{item.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {inboxItems.length > 0 && (
                      <div className="so-header__panel-footer">
                        <Link to="/rewards" className="so-header__panel-link" onClick={() => setActivePanel(null)}>
                          View all activity →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== ACHIEVEMENTS PANEL ===== */}
                {activePanel === 'achievements' && (
                  <div className="so-header__panel so-header__panel--achievements">
                    <div className="so-header__panel-header">
                      <h3>Achievements</h3>
                      <span className="so-header__panel-count so-header__panel-count--green">+{totalEarned} earned</span>
                    </div>

                    {/* Points summary */}
                    <div className="so-header__achievement-summary">
                      <div className="so-header__achievement-stat">
                        <span className="so-header__achievement-stat-value">{currentUser.points}</span>
                        <span className="so-header__achievement-stat-label">Total Points</span>
                      </div>
                      <div className="so-header__achievement-stat-divider" />
                      <div className="so-header__achievement-stat">
                        <span className="so-header__achievement-stat-value so-header__achievement-stat-value--green">+{totalEarned}</span>
                        <span className="so-header__achievement-stat-label">Earned</span>
                      </div>
                      <div className="so-header__achievement-stat-divider" />
                      <div className="so-header__achievement-stat">
                        <span className="so-header__achievement-stat-value so-header__achievement-stat-value--red">
                          -{transactions.filter(tx => tx.type === 'deducted' || tx.type === 'transferred').reduce((s, tx) => s + tx.amount, 0)}
                        </span>
                        <span className="so-header__achievement-stat-label">Spent</span>
                      </div>
                    </div>

                    <div className="so-header__panel-body">
                      {achievements.length === 0 ? (
                        <div className="so-header__panel-empty">
                          <span style={{ fontSize: '32px' }}>🏆</span>
                          <p>No achievements yet</p>
                          <span>Answer questions to earn points!</span>
                        </div>
                      ) : (
                        achievements.map(ach => (
                          <div key={ach.id} className="so-header__panel-item so-header__panel-item--achievement">
                            <span className="so-header__panel-item-points">{ach.points}</span>
                            <div className="so-header__panel-item-content">
                              <span className="so-header__panel-item-text">{ach.text}</span>
                              <span className="so-header__panel-item-time">{ach.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="so-header__panel-footer">
                      <Link to="/rewards" className="so-header__panel-link" onClick={() => setActivePanel(null)}>
                        View all rewards →
                      </Link>
                    </div>
                  </div>
                )}

                {/* ===== HELP PANEL ===== */}
                {activePanel === 'help' && (
                  <div className="so-header__panel so-header__panel--help">
                    <div className="so-header__panel-header">
                      <h3>Help</h3>
                    </div>
                    <div className="so-header__panel-body so-header__panel-body--help">
                      <Link to="/dashboard" className="so-header__help-item" onClick={() => setActivePanel(null)}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm4 9h-3v3H8v-3H5V8h3V5h2v3h3v2Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Tour</strong>
                          <span>Get an overview of the platform</span>
                        </div>
                      </Link>
                      <Link to="/ask" className="so-header__help-item" onClick={() => setActivePanel(null)}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.5 13H8v-1h1.5v1Zm1.6-5.5-.7.7c-.6.6-1 1-1 2.3H8c0-1.7.7-2.4 1.3-3l.8-.8A2.2 2.2 0 0 0 10.5 6c0-1.1-.9-2-2-2S6.5 4.9 6.5 6H5c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .9-.4 1.7-.9 2.5Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Ask a Question</strong>
                          <span>Get help from the community</span>
                        </div>
                      </Link>
                      <Link to="/rewards" className="so-header__help-item" onClick={() => setActivePanel(null)}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm3.7 11-3.7-2.2L5.3 12l1-4.2L3 5.3l4.3-.4L9 1l1.7 3.9 4.3.4-3.3 2.5 1 4.2Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Rewards & Points</strong>
                          <span>Learn how reputation works</span>
                        </div>
                      </Link>
                      <Link to="/subscription" className="so-header__help-item" onClick={() => setActivePanel(null)}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M15 1H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 14H3V3h12v12ZM5 9h8v2H5V9Zm0 4h4v2H5v-2Zm0-8h8v2H5V5Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Subscription Plans</strong>
                          <span>Upgrade your account</span>
                        </div>
                      </Link>
                      <Link to="/settings" className="so-header__help-item" onClick={() => setActivePanel(null)}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="m15.1 7.1-.9-.3c-.1-.3-.2-.6-.4-.9l.5-.8c.2-.4.2-.8-.1-1.1l-1.2-1.2c-.3-.3-.7-.3-1.1-.1l-.8.5c-.3-.2-.6-.3-.9-.4L10 2.2C9.9 1.8 9.5 1.5 9.1 1.5h-1.7c-.4 0-.8.3-.9.7l-.3.9c-.3.1-.6.2-.9.4l-.8-.5c-.4-.2-.8-.2-1.1.1L2.2 4.3c-.3.3-.3.7-.1 1.1l.5.8c-.2.3-.3.6-.4.9l-.9.3c-.4.1-.7.5-.7.9v1.7c0 .4.3.8.7.9l.9.3c.1.3.2.6.4.9l-.5.8c-.2.4-.2.8.1 1.1l1.2 1.2c.3.3.7.3 1.1.1l.8-.5c.3.2.6.3.9.4l.3.9c.1.4.5.7.9.7h1.7c.4 0 .8-.3.9-.7l.3-.9c.3-.1.6-.2.9-.4l.8.5c.4.2.8.2 1.1-.1l1.2-1.2c.3-.3.3-.7.1-1.1l-.5-.8c.2-.3.3-.6.4-.9l.9-.3c.4-.1.7-.5.7-.9V8c0-.4-.3-.8-.7-.9ZM8.2 11.3c-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1-1.4 3.1-3.1 3.1Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Settings</strong>
                          <span>Customize your experience</span>
                        </div>
                      </Link>
                      <a href="https://stackoverflow.com/help" target="_blank" rel="noopener noreferrer" className="so-header__help-item">
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M1 6c0-.6.4-1 1-1h14c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H7l-4 2v-2H2c-.6 0-1-.4-1-1V6Zm2 1v6h2v1l2-1h7V7H3Z" fill="currentColor"/></svg>
                        <div>
                          <strong>Stack Overflow Help</strong>
                          <span>Visit the official help center</span>
                        </div>
                      </a>
                    </div>
                  </div>
                )}

                {/* ===== COMMUNITY SWITCHER PANEL ===== */}
                {activePanel === 'community' && (
                  <div className="so-header__panel so-header__panel--community">
                    {/* Current Community */}
                    <div className="so-community__section">
                      <div className="so-community__section-header">
                        <span className="so-community__section-title">CURRENT COMMUNITY</span>
                        <div className="so-community__section-links">
                          <a href="https://stackoverflow.com/help" target="_blank" rel="noopener noreferrer">help</a>
                          <a href="https://chat.stackoverflow.com" target="_blank" rel="noopener noreferrer">chat</a>
                          <button className="so-community__logout-link" onClick={handleLogout}>log out</button>
                        </div>
                      </div>
                      <Link to="/dashboard" className="so-community__item so-community__item--current" onClick={() => setActivePanel(null)}>
                        <div className="so-community__item-icon">
                          <SOLogo size={16} />
                        </div>
                        <span className="so-community__item-name">Stack Overflow</span>
                      </Link>
                      <a href="https://meta.stackoverflow.com" target="_blank" rel="noopener noreferrer" className="so-community__item so-community__item--meta">
                        <div className="so-community__item-icon so-community__item-icon--meta">
                          <svg width="14" height="14" viewBox="0 0 32 37" fill="#838C95">
                            <path d="M26 33v-9h4v13H0V24h4v9h22Z"/>
                            <path d="m21.5 0-2.7 2 9.9 13.3 2.7-2L21.5 0ZM26 18.4 13.3 7.8l2.1-2.5 12.7 10.6-2.1 2.5ZM9.1 15.2l15 7 1.4-3-15-7-1.4 3Zm14 10.79.68-2.95-16.1-3.35L7 23l16.1 2.99ZM23 30H7v-3h16v3Z" fill="#838C95"/>
                          </svg>
                        </div>
                        <span className="so-community__item-name">Meta Stack Overflow</span>
                      </a>
                    </div>

                    {/* Your Communities */}
                    <div className="so-community__section">
                      <div className="so-community__section-header">
                        <span className="so-community__section-title">YOUR COMMUNITIES</span>
                        <a href="https://stackexchange.com/users/current?tab=communities" target="_blank" rel="noopener noreferrer" className="so-community__edit-link">edit</a>
                      </div>
                      <Link to="/dashboard" className="so-community__item so-community__item--yours" onClick={() => setActivePanel(null)}>
                        <div className="so-community__item-icon">
                          <SOLogo size={16} />
                        </div>
                        <span className="so-community__item-name">Stack Overflow</span>
                        <span className="so-community__item-rep">{currentUser.points}</span>
                      </Link>
                    </div>

                    {/* More Stack Exchange Communities */}
                    <div className="so-community__section so-community__section--more">
                      <div className="so-community__section-header">
                        <span className="so-community__section-title">MORE STACK EXCHANGE COMMUNITIES</span>
                        <a href="https://stackexchange.com/sites" target="_blank" rel="noopener noreferrer" className="so-community__blog-link">company blog</a>
                      </div>
                      <div className="so-community__search">
                        <svg width="15" height="15" viewBox="0 0 18 18" className="so-community__search-icon">
                          <path d="m18 16.5-5.14-5.18h-.35a7 7 0 1 0-1.19 1.19v.35L16.5 18l1.5-1.5ZM12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0Z" fill="currentColor"/>
                        </svg>
                        <input
                          type="text"
                          className="so-community__search-input"
                          placeholder="Find a Stack Exchange community"
                          value={communitySearch}
                          onChange={(e) => setCommunitySearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="so-community__list">
                        {filteredCommunities.map(community => (
                          <a
                            key={community.name}
                            href={community.url}
                            className="so-community__item so-community__item--exchange"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="so-community__item-emoji">{community.icon}</span>
                            <div className="so-community__item-info">
                              <span className="so-community__item-name">{community.name}</span>
                              <span className="so-community__item-desc">{community.desc}</span>
                            </div>
                          </a>
                        ))}
                        {filteredCommunities.length === 0 && (
                          <div className="so-community__empty">
                            No communities found matching "{communitySearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Visible Log out button */}
              <button className="so-header__logout-btn" onClick={handleLogout} title="Log out" id="btn-navbar-logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--outlined btn--sm" id="btn-login">Log in</Link>
              <Link to="/register" className="btn btn--primary btn--sm" id="btn-signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
