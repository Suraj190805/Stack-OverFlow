import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Saves.css';

export default function Saves() {
  const { currentUser, getUserById } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  // Saved items: [{ questionId, savedAt, listId }]
  const [savedItems, setSavedItems] = useLocalStorage('so_saved_items', []);
  // Custom lists: [{ id, name, createdAt }]
  const [customLists, setCustomLists] = useLocalStorage('so_saves_lists', []);
  // Questions data (shared with Dashboard)
  const [questions] = useLocalStorage('so_questions', []);

  // Active list filter: 'all' or a list id
  const [activeList, setActiveList] = useState('all');
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  // Create list form
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');
  // Move dropdown
  const [moveDropdownOpen, setMoveDropdownOpen] = useState(null);

  // Get saved questions with full data
  const savedQuestions = useMemo(() => {
    return savedItems
      .filter(item => activeList === 'all' || item.listId === activeList)
      .map(item => {
        const question = questions.find(q => q.id === item.questionId);
        if (!question) return null;
        return { ...question, savedAt: item.savedAt, listId: item.listId };
      })
      .filter(Boolean)
      .filter(q => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          q.title.toLowerCase().includes(query) ||
          q.tags.some(tag => tag.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }, [savedItems, questions, activeList, searchQuery]);

  // Count items per list
  const allCount = savedItems.length;
  const getListCount = (listId) => savedItems.filter(i => i.listId === listId).length;
  const unlistedCount = savedItems.filter(i => !i.listId).length;

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name) return;
    if (customLists.some(l => l.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A list with that name already exists');
      return;
    }
    const newList = {
      id: `list_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    setCustomLists(prev => [...prev, newList]);
    setNewListName('');
    setShowCreateList(false);
    toast.success(`List "${name}" created`);
  };

  const handleDeleteList = (listId) => {
    const list = customLists.find(l => l.id === listId);
    if (!list) return;
    // Move items from this list to "All saves" (remove listId)
    setSavedItems(prev =>
      prev.map(item => item.listId === listId ? { ...item, listId: undefined } : item)
    );
    setCustomLists(prev => prev.filter(l => l.id !== listId));
    if (activeList === listId) setActiveList('all');
    toast.info(`List "${list.name}" deleted`);
  };

  const handleUnsave = (questionId) => {
    setSavedItems(prev => prev.filter(item => item.questionId !== questionId));
    toast.info('Removed from saves');
  };

  const handleMoveToList = (questionId, listId) => {
    setSavedItems(prev =>
      prev.map(item =>
        item.questionId === questionId
          ? { ...item, listId: listId || undefined }
          : item
      )
    );
    setMoveDropdownOpen(null);
    const listName = listId
      ? customLists.find(l => l.id === listId)?.name || 'list'
      : 'All saves';
    toast.success(`Moved to "${listName}"`);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    return `${Math.floor(months / 12)} years ago`;
  };

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  };

  return (
    <div className="saves-page" id="saves-page">
      {/* Sidebar */}
      <aside className="saves-page__sidebar">
        <div className="saves-sidebar__header">
          <span className="saves-sidebar__title">{t('saves.mySaves')}</span>
          <button
            className="saves-sidebar__add-btn"
            onClick={() => setShowCreateList(!showCreateList)}
            title="Create new list"
          >
            +
          </button>
        </div>

        {showCreateList && (
          <div className="saves-create-list">
            <input
              className="saves-create-list__input"
              type="text"
              placeholder={t('saves.listName')}
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateList()}
              autoFocus
            />
            <button className="saves-create-list__submit" onClick={handleCreateList}>
              {t('saves.add')}
            </button>
            <button
              className="saves-create-list__cancel"
              onClick={() => { setShowCreateList(false); setNewListName(''); }}
            >
              ✕
            </button>
          </div>
        )}

        <ul className="saves-sidebar__lists">
          <li
            className={`saves-sidebar__item ${activeList === 'all' ? 'saves-sidebar__item--active' : ''}`}
            onClick={() => setActiveList('all')}
          >
            <span className="saves-sidebar__item-icon">🔖</span>
            <span className="saves-sidebar__item-label">{t('saves.allSaves')}</span>
            <span className="saves-sidebar__item-count">{allCount}</span>
          </li>

          {customLists.map(list => (
            <li
              key={list.id}
              className={`saves-sidebar__item ${activeList === list.id ? 'saves-sidebar__item--active' : ''}`}
              onClick={() => setActiveList(list.id)}
            >
              <span className="saves-sidebar__item-icon">📁</span>
              <span className="saves-sidebar__item-label">{list.name}</span>
              <span className="saves-sidebar__item-count">{getListCount(list.id)}</span>
              <span className="saves-sidebar__item-actions">
                <button
                  className="saves-sidebar__item-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                  title="Delete list"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="saves-page__main">
        <div className="saves-header">
          <div className="saves-header__left">
            <h1 className="saves-header__title">
              {activeList === 'all'
                ? 'All saves'
                : customLists.find(l => l.id === activeList)?.name || 'Saves'}
            </h1>
            <span className="saves-header__count">
              {savedQuestions.length} {savedQuestions.length === 1 ? t('saves.item') : t('saves.items')}
            </span>
          </div>
          <div className="saves-header__search">
            <svg className="saves-header__search-icon" width="14" height="14" viewBox="0 0 14 14">
              <path d="M10.5 9.1l3.4 3.4-1.4 1.4-3.4-3.4a5.5 5.5 0 1 1 1.4-1.4ZM6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor"/>
            </svg>
            <input
              className="saves-header__search-input"
              type="text"
              placeholder={t('saves.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Saved Items */}
        {savedQuestions.length === 0 ? (
          <div className="saves-empty">
            <div className="saves-empty__icon">🔖</div>
            <h2 className="saves-empty__title">
              {savedItems.length === 0
                ? t('saves.noSavedItems')
                : searchQuery
                  ? t('saves.noMatchingSaves')
                  : t('saves.emptyList')}
            </h2>
            <p className="saves-empty__text">
              {savedItems.length === 0
                ? t('saves.bookmarkHint')
                : searchQuery
                  ? t('saves.adjustSearch')
                  : t('saves.moveItems')}
            </p>
            {savedItems.length === 0 && (
              <Link to="/dashboard" className="saves-empty__cta">
                {t('saves.browseQuestions')}
              </Link>
            )}
          </div>
        ) : (
          <div className="saves-list">
            {savedQuestions.map(q => {
              const author = getUserById(q.userId);
              const netVotes = q.upvotes - q.downvotes;
              const hasAccepted = q.answers > 0;
              const views = q.views || 0;

              return (
                <div className="saves-item" key={q.id}>
                  {/* Stats */}
                  <div className="saves-item__stats">
                    <div className="so-stat" title="Score">
                      <span className="so-stat__value">{netVotes}</span>
                      <span className="so-stat__label">{netVotes === 1 ? t('saves.vote') : t('saves.votes')}</span>
                    </div>
                    <div
                      className={`so-stat ${hasAccepted ? 'so-stat--answered' : 'so-stat--zero'}`}
                      title="Answers"
                    >
                      <span className="so-stat__value">{q.answers}</span>
                      <span className="so-stat__label">{q.answers === 1 ? t('saves.answer') : t('saves.answers')}</span>
                    </div>
                    <div className="so-stat" title="Views">
                      <span className="so-stat__value">{formatCount(views)}</span>
                      <span className="so-stat__label">{t('saves.views')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="saves-item__content">
                    <Link to="/dashboard" className="saves-item__title">
                      {q.title}
                    </Link>
                    {q.body && (
                      <p className="saves-item__excerpt">
                        {q.body.length > 180 ? q.body.substring(0, 180) + '...' : q.body}
                      </p>
                    )}

                    <div className="saves-item__meta">
                      <div className="saves-item__tags">
                        {q.tags.map(tag => (
                          <span key={tag} className="s-tag">{tag}</span>
                        ))}
                      </div>
                      <div className="saves-item__info">
                        <span>
                          {author?.displayName || 'Unknown'} · asked {timeAgo(q.createdAt)}
                        </span>

                        {/* Move to list */}
                        {customLists.length > 0 && (
                          <div style={{ position: 'relative' }}>
                            <button
                              className="saves-item__move-btn"
                              onClick={() => setMoveDropdownOpen(
                                moveDropdownOpen === q.id ? null : q.id
                              )}
                            >
                              📂 {t('saves.move')}
                            </button>
                            {moveDropdownOpen === q.id && (
                              <div className="saves-item__move-dropdown">
                                <button
                                  className={`saves-item__move-option ${!q.listId ? 'saves-item__move-option--active' : ''}`}
                                  onClick={() => handleMoveToList(q.id, null)}
                                >
                                  🔖 {t('saves.allSaves')}
                                </button>
                                {customLists.map(list => (
                                  <button
                                    key={list.id}
                                    className={`saves-item__move-option ${q.listId === list.id ? 'saves-item__move-option--active' : ''}`}
                                    onClick={() => handleMoveToList(q.id, list.id)}
                                  >
                                    📁 {list.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Unsave */}
                        <button
                          className="saves-item__unsave"
                          onClick={() => handleUnsave(q.id)}
                          title="Remove from saves"
                        >
                          ✕ {t('saves.unsave')}
                        </button>
                      </div>
                    </div>

                    <div className="saves-item__saved-date">
                      🔖 {t('saves.saved')} {timeAgo(q.savedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
