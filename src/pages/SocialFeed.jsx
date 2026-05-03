import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_POSTS } from '../data/mockUsers';
import { getDailyCount, incrementDailyCount } from '../utils/rateLimit';
import './SocialFeed.css';

export default function SocialFeed() {
  const { currentUser, getUserById } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [posts, setPosts] = useLocalStorage('so_social_posts', MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [error, setError] = useState('');

  // Media upload state
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  if (!currentUser) return <Navigate to="/login" />;

  const friendCount = currentUser.friends?.length || 0;
  const dailyPostCount = getDailyCount('social_posts', currentUser.id);

  // PRD Module 3: Friend-count-based posting limits
  let maxPosts = 0;
  if (friendCount === 0) maxPosts = 0;
  else if (friendCount <= 10) maxPosts = friendCount;
  else maxPosts = Infinity;

  const canPost = maxPosts === Infinity || dailyPostCount < maxPosts;
  const remaining = maxPosts === Infinity ? '∞' : Math.max(0, maxPosts - dailyPostCount);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaData(reader.result);
      setMediaType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Video must be under 20MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaData(reader.result);
      setMediaType('video');
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaData(null);
    setMediaType(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleCreatePost = () => {
    setError('');
    if (friendCount === 0) {
      setError(t('social.noFriends'));
      return;
    }
    if (!canPost) {
      setError(t('social.dailyLimitReached'));
      return;
    }
    if (!newPostContent.trim() && !mediaData) return;

    const post = {
      id: `p_${Date.now()}`,
      userId: currentUser.id,
      content: newPostContent.trim(),
      media: mediaData,
      mediaType: mediaType,
      likes: [],
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts(prev => [post, ...prev]);
    incrementDailyCount('social_posts', currentUser.id);
    setNewPostContent('');
    clearMedia();
    toast.success('Post published! 🎉');
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.info('Post deleted');
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: liked
            ? p.likes.filter(id => id !== currentUser.id)
            : [...p.likes, currentUser.id]
        };
      }
      return p;
    }));
  };

  const handleComment = (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, { userId: currentUser.id, text, createdAt: new Date().toISOString() }]
        };
      }
      return p;
    }));
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
    toast.info('Post shared!');
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="page-header">
          <h1 className="page-title">{t('social.title')}</h1>
          <p className="page-subtitle">
            👥 {friendCount} {t('profile.friends')} · {remaining} {t('social.postsRemaining')}
          </p>
        </div>

        {error && <div className="alert alert--warning" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Create Post */}
        <div className="card create-post-card">
          <div className="create-post__header">
            <div className="create-post__avatar">{currentUser.displayName.charAt(0)}</div>
            <textarea
              className="form-textarea create-post__textarea"
              placeholder={t('social.whatsOnMind')}
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              rows={3}
              disabled={friendCount === 0}
            />
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className="media-preview">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="media-preview__img" />
              ) : (
                <video src={mediaPreview} className="media-preview__video" controls />
              )}
              <button className="media-preview__remove" onClick={clearMedia}>✕</button>
            </div>
          )}

          <div className="create-post__actions">
            <div className="create-post__media">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
              <button
                className="btn btn--ghost btn--sm media-btn"
                onClick={() => photoInputRef.current?.click()}
                disabled={friendCount === 0}
              >
                📷 {t('social.addPhoto')}
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleVideoSelect}
              />
              <button
                className="btn btn--ghost btn--sm media-btn"
                onClick={() => videoInputRef.current?.click()}
                disabled={friendCount === 0}
              >
                🎥 {t('social.addVideo')}
              </button>
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleCreatePost}
              disabled={!canPost || (!newPostContent.trim() && !mediaData)}
            >
              {t('social.post')}
            </button>
          </div>
          {friendCount === 0 && (
            <div className="alert alert--info" style={{ marginTop: '12px' }}>
              {t('social.noFriends')}
            </div>
          )}
        </div>

        {/* Feed */}
        <div className="social-feed">
          {posts.map((post, index) => {
            const author = getUserById(post.userId);
            const isLiked = post.likes.includes(currentUser.id);
            const isOwner = post.userId === currentUser.id;
            return (
              <div
                key={post.id}
                className="card post-card animate-fade"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="post-card__header">
                  <div className="post-card__avatar">{author?.displayName?.charAt(0) || '?'}</div>
                  <div className="post-card__author-info">
                    <div className="post-card__author">{author?.displayName || 'Unknown'}</div>
                    <div className="post-card__time">{new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                  {isOwner && (
                    <button
                      className="post-card__delete"
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {post.content && <p className="post-card__content">{post.content}</p>}

                {/* Render media */}
                {post.media && post.mediaType === 'image' && (
                  <div className="post-card__media">
                    <img src={post.media} alt="Post" className="post-card__media-img" />
                  </div>
                )}
                {post.media && post.mediaType === 'video' && (
                  <div className="post-card__media">
                    <video src={post.media} className="post-card__media-video" controls />
                  </div>
                )}

                <div className="post-card__stats">
                  <span>{post.likes.length} {t('social.like')}s</span>
                  <span>{post.comments.length} {t('social.comments')}</span>
                  <span>{post.shares} {t('social.share')}s</span>
                </div>
                <div className="post-card__actions">
                  <button className={`btn btn--ghost btn--sm ${isLiked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                    {isLiked ? '❤️' : '🤍'} {t('social.like')}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}>
                    💬 {t('social.comment')}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleShare(post.id)}>
                    🔗 {t('social.share')}
                  </button>
                </div>
                {showComments[post.id] && (
                  <div className="post-card__comments animate-fade">
                    {post.comments.map((c, i) => {
                      const cAuthor = getUserById(c.userId);
                      return (
                        <div key={i} className="comment-item">
                          <strong>{cAuthor?.displayName || 'Unknown'}</strong>
                          <span>{c.text}</span>
                        </div>
                      );
                    })}
                    <div className="comment-input">
                      <input
                        className="form-input"
                        placeholder={t('social.addComment')}
                        value={commentTexts[post.id] || ''}
                        onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button className="btn btn--primary btn--sm" onClick={() => handleComment(post.id)}>→</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
