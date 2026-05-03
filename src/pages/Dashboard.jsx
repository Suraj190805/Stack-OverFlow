import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../contexts/PointsContext';
import { useToast } from '../contexts/ToastContext';
import { questionsAPI, answersAPI } from '../services/api';
import './Dashboard.css';
import './Saves.css';

export default function Dashboard() {
  const { currentUser, getUserById } = useAuth();
  const { t } = useLanguage();
  const { refreshTransactions } = usePoints();
  const toast = useToast();

  // Server-fetched state
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [answers, setAnswers] = useState({});     // { questionId: [answer, ...] }
  const [userVotes, setUserVotes] = useState({});  // { targetId: 'up'|'down' }
  const [savedItems, setSavedItems] = useState([]); // [{ questionId, savedAt }]
  const [answerTexts, setAnswerTexts] = useState({});
  const [expandedQ, setExpandedQ] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [bountiedCount, setBountiedCount] = useState(0);

  // Read tag from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTag = searchParams.get('tag') || '';

  // Search, filter, sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState(urlTag);
  const [sortBy, setSortBy] = useState('newest');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // ── Fetch questions from API ──────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const data = await questionsAPI.getAll({
        page: currentPage,
        limit: perPage,
        sort: sortBy,
        tag: filterTag || undefined,
        search: searchQuery || undefined,
      });
      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      toast.error('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  }, [currentPage, perPage, sortBy, filterTag, searchQuery]);

  // ── Fetch user votes and saves ────────────────────────
  const fetchUserData = useCallback(async () => {
    try {
      const [votesData, savesData, bountiedData] = await Promise.all([
        questionsAPI.getUserVotes(),
        questionsAPI.getUserSaves(),
        questionsAPI.getBountiedCount(),
      ]);
      setUserVotes(votesData.votes || {});
      setSavedItems((savesData.saves || []).map(s => ({
        questionId: s.questionId?._id || s.questionId,
        savedAt: s.savedAt,
      })));
      setBountiedCount(bountiedData.count || 0);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // Sync filterTag with URL
  useEffect(() => {
    const currentUrlTag = searchParams.get('tag') || '';
    if (currentUrlTag !== filterTag) {
      if (filterTag) {
        setSearchParams({ tag: filterTag }, { replace: true });
      } else {
        searchParams.delete('tag');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [filterTag]);

  useEffect(() => {
    const tagFromUrl = searchParams.get('tag') || '';
    if (tagFromUrl !== filterTag) {
      setFilterTag(tagFromUrl);
    }
  }, [searchParams]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterTag, sortBy]);

  // Fetch answers when a question is expanded
  useEffect(() => {
    if (expandedQ && !answers[expandedQ]) {
      answersAPI.getForQuestion(expandedQ)
        .then(data => {
          setAnswers(prev => ({ ...prev, [expandedQ]: data.answers || [] }));
        })
        .catch(err => console.error('Failed to fetch answers:', err));
    }
  }, [expandedQ]);

  // ── All tags (from current page) ──────────────────────
  const allTags = useMemo(() => {
    const tags = new Set();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [questions]);

  const isQuestionSaved = (qId) => savedItems.some(item => item.questionId === qId);

  // ── Pagination helpers ────────────────────────────────
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * perPage;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedQ(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Vote Handlers ─────────────────────────────────────
  const handleUpvote = async (qId) => {
    try {
      const data = await questionsAPI.vote(qId, 'up');
      // Update question in list
      setQuestions(prev => prev.map(q => q._id === qId ? data.question : q));
      // Update vote map
      if (data.action === 'removed') {
        setUserVotes(prev => { const copy = { ...prev }; delete copy[qId]; return copy; });
        toast.info('Upvote removed');
      } else {
        setUserVotes(prev => ({ ...prev, [qId]: 'up' }));
        if (data.question.upvotes % 5 === 0) toast.points('🎉 5-upvote bonus awarded!');
      }
      refreshTransactions();
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  const handleDownvote = async (qId) => {
    try {
      const data = await questionsAPI.vote(qId, 'down');
      setQuestions(prev => prev.map(q => q._id === qId ? data.question : q));
      if (data.action === 'removed') {
        setUserVotes(prev => { const copy = { ...prev }; delete copy[qId]; return copy; });
        toast.info('Downvote removed');
      } else {
        setUserVotes(prev => ({ ...prev, [qId]: 'down' }));
      }
      refreshTransactions();
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  // ── Save/Bookmark Handler ─────────────────────────────
  const handleToggleSave = async (qId) => {
    try {
      const data = await questionsAPI.toggleSave(qId);
      if (data.saved) {
        setSavedItems(prev => [...prev, { questionId: qId, savedAt: new Date().toISOString() }]);
        toast.success('Question saved! 🔖');
      } else {
        setSavedItems(prev => prev.filter(item => item.questionId !== qId));
        toast.info('Removed from saves');
      }
    } catch (err) {
      toast.error('Save failed');
    }
  };

  // ── Answer Handlers ───────────────────────────────────
  const handleAnswer = async (qId) => {
    const text = answerTexts[qId]?.trim();
    if (!text) return;

    try {
      const data = await answersAPI.create(qId, text);
      setAnswers(prev => ({
        ...prev,
        [qId]: [...(prev[qId] || []), data.answer],
      }));
      setAnswerTexts(prev => ({ ...prev, [qId]: '' }));
      // Refresh question to get updated answer count
      fetchQuestions();
      refreshTransactions();
      toast.success('Answer posted! +5 points earned 🎯');
    } catch (err) {
      toast.error('Failed to post answer');
    }
  };

  const handleAnswerUpvote = async (qId, answerId) => {
    try {
      const data = await answersAPI.vote(answerId, 'up');
      setAnswers(prev => ({
        ...prev,
        [qId]: (prev[qId] || []).map(a => a._id === answerId ? data.answer : a),
      }));
      const voteKey = `ans_${answerId}`;
      if (data.action === 'removed') {
        setUserVotes(prev => { const copy = { ...prev }; delete copy[voteKey]; return copy; });
        toast.info('Upvote removed');
      } else {
        setUserVotes(prev => ({ ...prev, [voteKey]: 'up' }));
        if (data.answer.upvotes === 5) toast.points('🎉 Answer hit 5 upvotes! +5 bonus points!');
      }
      refreshTransactions();
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  const handleAnswerDownvote = async (qId, answerId) => {
    try {
      const data = await answersAPI.vote(answerId, 'down');
      setAnswers(prev => ({
        ...prev,
        [qId]: (prev[qId] || []).map(a => a._id === answerId ? data.answer : a),
      }));
      const voteKey = `ans_${answerId}`;
      if (data.action === 'removed') {
        setUserVotes(prev => { const copy = { ...prev }; delete copy[voteKey]; return copy; });
        toast.info('Downvote removed');
      } else {
        setUserVotes(prev => ({ ...prev, [voteKey]: 'down' }));
        toast.info('Answer downvoted — points deducted');
      }
      refreshTransactions();
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  const handleDeleteAnswer = async (qId, answerId) => {
    try {
      await answersAPI.delete(answerId);
      setAnswers(prev => ({
        ...prev,
        [qId]: (prev[qId] || []).filter(a => a._id !== answerId),
      }));
      fetchQuestions();
      refreshTransactions();
      toast.info('Answer removed — 5 points deducted');
    } catch (err) {
      toast.error('Failed to delete answer');
    }
  };

  // ── Helpers ───────────────────────────────────────────
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
    const years = Math.floor(months / 12);
    return `${years} years ago`;
  };

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="so-questions">
      {/* Header */}
      <div className="so-questions__header">
        <h1 className="so-questions__title">
          {sortBy === 'bountied' ? 'Bountied' : sortBy === 'unanswered' ? 'Unanswered' : sortBy === 'active' ? 'Active' : 'Newest'} Questions
        </h1>
        <Link to="/ask" className="btn btn--primary" id="btn-ask-question">Ask Question</Link>
      </div>

      {/* Info bar */}
      <div className="so-questions__info">
        <span className="so-questions__count">{totalQuestions.toLocaleString()} questions</span>
        <div className="so-questions__filters">
          <div className="so-filter-tabs">
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'active', label: 'Active' },
              { key: 'bountied', label: 'Bountied', badge: bountiedCount },
              { key: 'unanswered', label: 'Unanswered' },
            ].map(s => (
              <button
                key={s.key}
                className={`so-filter-tab ${sortBy === s.key ? 'so-filter-tab--active' : ''}`}
                onClick={() => { setSortBy(s.key); setShowMoreMenu(false); }}
              >
                {s.label}
                {s.badge > 0 && <span className="so-filter-tab__badge">{s.badge}</span>}
              </button>
            ))}
            {/* More dropdown */}
            <div className="so-filter-more-wrapper">
              <button
                className={`so-filter-tab so-filter-tab--more ${['frequent', 'score'].includes(sortBy) ? 'so-filter-tab--active' : ''}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                More ▾
              </button>
              {showMoreMenu && (
                <div className="so-filter-more-dropdown">
                  <button
                    className={`so-filter-more-item ${sortBy === 'frequent' ? 'so-filter-more-item--active' : ''}`}
                    onClick={() => { setSortBy('frequent'); setShowMoreMenu(false); }}
                  >
                    Frequent
                  </button>
                  <button
                    className={`so-filter-more-item ${sortBy === 'score' ? 'so-filter-more-item--active' : ''}`}
                    onClick={() => { setSortBy('score'); setShowMoreMenu(false); }}
                  >
                    Score
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            className={`btn btn--secondary btn--sm ${showFilterPanel ? 'btn--secondary--active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1h12v2H1V1zm1 4h10v2H2V5zm2 4h6v2H4V9z" fill="currentColor"/></svg>
            Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="so-filter-panel">
          <div className="so-filter-panel__section">
            <label className="so-filter-panel__label">Filter by tag</label>
            <select
              className="form-select so-filter-panel__select"
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="so-filter-panel__actions">
            <button className="btn btn--primary btn--sm" onClick={() => setShowFilterPanel(false)}>Apply filter</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { setFilterTag(''); setShowFilterPanel(false); }}>Clear</button>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="so-question-list">
        {loadingQuestions ? (
          <div className="so-question-empty">
            <p>Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="so-question-empty">
            <p>No questions matched your criteria.</p>
            <Link to="/ask" className="btn btn--primary btn--sm">Ask a Question</Link>
          </div>
        ) : (
          questions.map(q => {
            const author = q.userId; // Already populated from API
            const qAnswers = answers[q._id] || [];
            const netVotes = q.upvotes - q.downvotes;
            const hasAccepted = q.answerCount > 0;
            const views = q.views || 0;

            return (
              <div className="so-question-row" key={q._id}>
                {/* Stats */}
                <div className="so-question-row__stats">
                  <div className="so-stat" title="Score">
                    <span className="so-stat__value">{netVotes}</span>
                    <span className="so-stat__label">{netVotes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                  <div className={`so-stat ${hasAccepted ? 'so-stat--answered' : 'so-stat--zero'}`} title="Answers">
                    <span className="so-stat__value">{q.answerCount}</span>
                    <span className="so-stat__label">{q.answerCount === 1 ? 'answer' : 'answers'}</span>
                  </div>
                  <div className="so-stat" title="Views">
                    <span className="so-stat__value">{formatCount(views)}</span>
                    <span className="so-stat__label">views</span>
                  </div>
                  <button
                    className={`so-bookmark-btn ${isQuestionSaved(q._id) ? 'so-bookmark-btn--active' : ''}`}
                    onClick={() => handleToggleSave(q._id)}
                    title={isQuestionSaved(q._id) ? 'Unsave this question' : 'Save this question'}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path
                        d={isQuestionSaved(q._id)
                          ? "M3 1h12c.6 0 1 .4 1 1v14.4a.5.5 0 0 1-.8.4L9 13.2l-6.2 3.6a.5.5 0 0 1-.8-.4V2c0-.6.4-1 1-1Z"
                          : "M3 1h12c.6 0 1 .4 1 1v14.4a.5.5 0 0 1-.8.4L9 13.2l-6.2 3.6a.5.5 0 0 1-.8-.4V2c0-.6.4-1 1-1Zm1 1.5v11.7l5-2.9 5 2.9V2.5H4Z"
                        }
                        fill="currentColor"
                      />
                    </svg>
                    <span className="so-bookmark-btn__tooltip">
                      {isQuestionSaved(q._id) ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>

                {/* Content */}
                <div className="so-question-row__content">
                  {q.category && (
                    <span className={`so-question-row__category so-question-row__category--${q.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {q.category}
                    </span>
                  )}
                  {q.bounty && q.bounty > 0 && (
                    <span className="so-question-row__bounty">+{q.bounty}</span>
                  )}
                  <h3 className="so-question-row__title">
                    <span onClick={() => setExpandedQ(expandedQ === q._id ? null : q._id)} style={{ cursor: 'pointer' }}>
                      {q.title}
                    </span>
                  </h3>

                  {q.body && (
                    <p className="so-question-row__excerpt">
                      {q.body.length > 180 ? q.body.substring(0, 180) + '...' : q.body}
                    </p>
                  )}

                  {/* Expanded Answer Section */}
                  {expandedQ === q._id && (
                    <div className="so-question-row__expanded">
                      <p className="so-question-row__full-body">{q.body}</p>

                      {/* Vote Controls */}
                      <div className="so-question-row__vote-controls">
                        <button className={`so-vote-btn ${userVotes[q._id] === 'up' ? 'so-vote-btn--active-up' : ''}`} onClick={() => handleUpvote(q._id)} title="Upvote">▲</button>
                        <span className="so-vote-count">{netVotes}</span>
                        <button className={`so-vote-btn ${userVotes[q._id] === 'down' ? 'so-vote-btn--active-down' : ''}`} onClick={() => handleDownvote(q._id)} title="Downvote">▼</button>
                      </div>

                      {/* Answers */}
                      <div className="so-answers-section">
                        <h4 className="so-answers-section__title">{q.answerCount} Answers</h4>
                        {qAnswers.map(a => {
                          const aAuthor = a.userId; // populated
                          const ansVotes = (a.upvotes || 0) - (a.downvotes || 0);
                          return (
                            <div key={a._id} className="so-answer-item">
                              <div className="so-answer-item__layout">
                                <div className="so-answer-item__votes">
                                  <button className={`so-vote-btn so-vote-btn--sm ${userVotes[`ans_${a._id}`] === 'up' ? 'so-vote-btn--active-up' : ''}`} onClick={() => handleAnswerUpvote(q._id, a._id)} title="Upvote answer">▲</button>
                                  <span className="so-answer-vote-count">{ansVotes}</span>
                                  <button className={`so-vote-btn so-vote-btn--sm ${userVotes[`ans_${a._id}`] === 'down' ? 'so-vote-btn--active-down' : ''}`} onClick={() => handleAnswerDownvote(q._id, a._id)} title="Downvote answer">▼</button>
                                </div>
                                <div className="so-answer-item__body">
                                  <p>{a.body}</p>
                                  <div className="so-answer-item__footer">
                                    <span className="so-answer-item__author">
                                      — {aAuthor?.displayName || 'Unknown'}, {timeAgo(a.createdAt)}
                                      {(a.upvotes || 0) >= 5 && <span className="so-answer-badge">⭐ Top Answer</span>}
                                    </span>
                                    {(aAuthor?._id === currentUser?._id) && (
                                      <button
                                        className="btn btn--ghost btn--sm so-answer-delete"
                                        onClick={() => handleDeleteAnswer(q._id, a._id)}
                                        title="Delete your answer (−5 points)"
                                      >
                                        🗑️ Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Answer Form */}
                        <div className="so-answer-form">
                          <h4>Your Answer</h4>
                          <textarea
                            className="form-textarea"
                            placeholder="Write your answer..."
                            value={answerTexts[q._id] || ''}
                            onChange={e => setAnswerTexts(prev => ({ ...prev, [q._id]: e.target.value }))}
                            rows={4}
                          />
                          <button className="btn btn--primary" onClick={() => handleAnswer(q._id)}>
                            Post Your Answer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="so-question-row__meta">
                    <div className="so-question-row__tags">
                      {q.tags.map(tag => (
                        <span
                          key={tag}
                          className={`s-tag ${filterTag === tag ? 'tag--active' : ''}`}
                          onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="so-question-row__author">
                      <div className="so-question-row__author-avatar">
                        {author?.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <a className="so-question-row__author-name" href="#">
                        {author?.displayName || 'Unknown'}
                      </a>
                      <span className="so-question-row__author-rep">
                        {author?.points || 1}
                      </span>
                      <span className="so-question-row__time">
                        asked {timeAgo(q.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalQuestions > 0 && totalPages > 1 && (
        <div className="so-pagination">
          <div className="so-pagination__pages">
            <button
              className="so-pagination__btn so-pagination__nav"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
            >
              Prev
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="so-pagination__ellipsis">…</span>
              ) : (
                <button
                  key={page}
                  className={`so-pagination__btn ${page === safeCurrentPage ? 'so-pagination__btn--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="so-pagination__btn so-pagination__nav"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div className="so-pagination__info">
            <span className="so-pagination__range">
              {startIndex + 1}–{Math.min(startIndex + perPage, totalQuestions)} of {totalQuestions}
            </span>
            <select
              className="so-pagination__per-page"
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={15}>15 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
