import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../contexts/PointsContext';
import { useToast } from '../contexts/ToastContext';
import { questionsAPI } from '../services/api';
import { SUBSCRIPTION_PLANS } from '../data/mockUsers';
import { getDailyCount, incrementDailyCount } from '../utils/rateLimit';
import './AskQuestion.css';

const POPULAR_TAGS = ['javascript', 'react', 'css', 'html', 'node.js', 'python', 'typescript', 'api', 'database', 'git', 'hooks', 'async', 'flexbox', 'testing'];

export default function AskQuestion() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { earnForQuestion } = usePoints();
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!currentUser) return <Navigate to="/login" />;

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentUser.plan) || SUBSCRIPTION_PLANS[0];
  const dailyCount = getDailyCount('questions', currentUser._id);
  const remaining = plan.questionsPerDay === Infinity ? '∞' : plan.questionsPerDay - dailyCount;
  const canPost = plan.questionsPerDay === Infinity || dailyCount < plan.questionsPerDay;

  const suggestedTags = useMemo(() => {
    if (!tagInput.trim()) return [];
    const q = tagInput.toLowerCase();
    return POPULAR_TAGS.filter(t => t.includes(q) && !tags.includes(t)).slice(0, 5);
  }, [tagInput, tags]);

  const addTag = (tag) => {
    if (tags.length >= 5) return;
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(',', '');
      if (val) addTag(val);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canPost) {
      setError(t('questions.dailyLimitReached'));
      return;
    }

    if (!title.trim()) {
      setError('Question title is required.');
      return;
    }

    if (!body.trim()) {
      setError('Question body is required.');
      return;
    }

    try {
      await questionsAPI.create({
        title: title.trim(),
        body: body.trim(),
        tags: tags.length > 0 ? tags : ['general'],
      });

      incrementDailyCount('questions', currentUser._id);
      if (earnForQuestion) earnForQuestion(currentUser._id);
      toast.success('Question posted! 🎯');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to post question.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '820px' }}>
        <h1 className="page-title">{t('questions.askQuestion')}</h1>

        {/* Plan info bar */}
        <div className="ask-plan-bar card">
          <div className="ask-plan-bar__item">
            <span className="ask-plan-bar__icon">📋</span>
            <span className="ask-plan-bar__label">Plan</span>
            <span className="ask-plan-bar__value">{plan.name}</span>
          </div>
          <div className="ask-plan-bar__divider" />
          <div className="ask-plan-bar__item">
            <span className="ask-plan-bar__icon">📊</span>
            <span className="ask-plan-bar__label">Today</span>
            <span className="ask-plan-bar__value">{dailyCount} / {plan.questionsPerDay === Infinity ? '∞' : plan.questionsPerDay}</span>
          </div>
          <div className="ask-plan-bar__divider" />
          <div className="ask-plan-bar__item">
            <span className="ask-plan-bar__icon">{canPost ? '✅' : '🚫'}</span>
            <span className="ask-plan-bar__label">Remaining</span>
            <span className="ask-plan-bar__value" style={{ color: canPost ? 'var(--success)' : 'var(--error)' }}>{remaining}</span>
          </div>
        </div>

        {!canPost && (
          <div className="alert alert--warning" style={{ marginBottom: '16px' }}>
            {t('questions.dailyLimitReached')} — Upgrade your plan for more questions per day.
          </div>
        )}

        {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Question Form */}
        <div className="ask-form-wrapper card animate-fade">
          {/* Toggle Preview */}
          <div className="ask-tab-bar">
            <button className={`ask-tab ${!showPreview ? 'ask-tab--active' : ''}`} onClick={() => setShowPreview(false)}>✍️ Write</button>
            <button className={`ask-tab ${showPreview ? 'ask-tab--active' : ''}`} onClick={() => setShowPreview(true)} disabled={!title && !body}>👁️ Preview</button>
          </div>

          {showPreview ? (
            <div className="ask-preview">
              <h2 className="ask-preview__title">{title || 'Untitled Question'}</h2>
              <p className="ask-preview__body">{body || 'No description yet.'}</p>
              <div className="ask-preview__tags">
                {tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
                {tags.length === 0 && <span className="text-muted text-sm">No tags added</span>}
              </div>
            </div>
          ) : (
            <form className="ask-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  {t('questions.questionTitle')}
                  <span className="form-label__hint">Be specific and summarize your problem</span>
                </label>
                <input
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. How to center a div using flexbox?"
                  required
                  disabled={!canPost}
                />
                {title && <span className="char-count">{title.length}/150</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t('questions.questionBody')}
                  <span className="form-label__hint">Include everything needed to answer your question</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Describe what you've tried and what you expect to happen..."
                  rows={8}
                  required
                  disabled={!canPost}
                />
                {body && <span className="char-count">{body.length} chars</span>}
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">
                  {t('questions.tags')}
                  <span className="form-label__hint">Add up to 5 tags (press Enter or comma to add)</span>
                </label>
                <div className="tag-input-wrapper">
                  {tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button type="button" className="tag-chip__remove" onClick={() => removeTag(tag)}>✕</button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length >= 5 ? 'Max 5 tags' : 'Add a tag...'}
                    disabled={!canPost || tags.length >= 5}
                  />
                </div>
                {suggestedTags.length > 0 && (
                  <div className="tag-suggestions">
                    {suggestedTags.map(tag => (
                      <button key={tag} type="button" className="tag-suggestion" onClick={() => addTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="ask-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--lg" disabled={!canPost}>
                  {t('questions.postQuestion')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Writing Tips */}
        <div className="card ask-tips" style={{ marginTop: '16px' }}>
          <h3 className="ask-tips__title">📝 Writing a good question</h3>
          <ul className="ask-tips__list">
            <li>Summarize your problem in a one-line title</li>
            <li>Describe what you've tried and your expected results</li>
            <li>Include code samples and error messages when applicable</li>
            <li>Add relevant tags so others can find your question</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
