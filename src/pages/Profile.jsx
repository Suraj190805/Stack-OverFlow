import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../contexts/PointsContext';
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatIST } from '../utils/timeRestrictions';
import './Profile.css';

export default function Profile() {
  const { currentUser, getUserById, getUserLoginHistory, updateUser, getAllUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, removeFriend, getIncomingRequests, getOutgoingRequests } = useAuth();
  const { t } = useLanguage();
  const { getUserTransactions } = usePoints();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });
  const avatarInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Read data from localStorage for activity
  const [questions] = useLocalStorage('so_questions', []);
  const [answers] = useLocalStorage('so_answers', {});
  const [socialPosts] = useLocalStorage('so_social_posts', []);

  if (!currentUser) return <Navigate to="/login" />;

  const loginHistory = getUserLoginHistory(currentUser.id);
  const friends = currentUser.friends?.map(id => getUserById(id)).filter(Boolean) || [];
  const transactions = getUserTransactions(currentUser.id);

  // Activity data
  const myQuestions = questions.filter(q => q.userId === currentUser.id);
  const myAnswers = Object.values(answers).flat().filter(a => a.userId === currentUser.id);
  const myPosts = socialPosts.filter(p => p.userId === currentUser.id);

  // Friend request data
  const incomingRequests = getIncomingRequests();
  const outgoingRequests = getOutgoingRequests();
  const allUsers = getAllUsers().filter(u => u.id !== currentUser.id);

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u =>
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const getFriendStatus = (userId) => {
    if (currentUser.friends?.includes(userId)) return 'friend';
    if (outgoingRequests.find(r => r.to === userId)) return 'sent';
    if (incomingRequests.find(r => r.from === userId)) return 'received';
    return 'none';
  };

  const handleSendRequest = (userId) => {
    const result = sendFriendRequest(userId);
    if (result.success) {
      toast.success('Friend added! 🎉');
    }
  };

  const handleAcceptRequest = (userId) => {
    acceptFriendRequest(userId);
    toast.success('Friend request accepted! 🤝');
  };

  const handleRejectRequest = (userId) => {
    rejectFriendRequest(userId);
    toast.info('Friend request declined');
  };

  const handleCancelRequest = (userId) => {
    cancelFriendRequest(userId);
    toast.info('Friend request cancelled');
  };

  const handleRemoveFriend = (userId) => {
    removeFriend(userId);
    toast.info('Friend removed');
  };

  const startEditing = () => {
    setEditForm({
      displayName: currentUser.displayName,
      bio: currentUser.bio || '',
    });
    setIsEditing(true);
  };

  const saveProfile = () => {
    if (!editForm.displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    updateUser(currentUser.id, {
      displayName: editForm.displayName.trim(),
      bio: editForm.bio.trim(),
    });
    setIsEditing(false);
    toast.success('Profile updated! ✨');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateUser(currentUser.id, { avatar: reader.result });
      toast.success('Avatar updated!');
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview', icon: '📊' },
    { key: 'people', label: `👥 Find People${incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ''}`, icon: '👥' },
    { key: 'activity', label: '📋 Activity', icon: '📋' },
    { key: 'history', label: '🔐 Login History', icon: '🔐' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Profile Header */}
        <div className="profile-header card">
          <div className="profile-header__avatar-wrapper">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="profile-header__avatar-img" />
            ) : (
              <div className="profile-header__avatar">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
            <button
              className="profile-header__avatar-edit"
              onClick={() => avatarInputRef.current?.click()}
              title="Change avatar"
            >
              📷
            </button>
          </div>
          <div className="profile-header__info">
            {isEditing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    className="form-input"
                    value={editForm.displayName}
                    onChange={e => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={editForm.bio}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={2}
                    placeholder="Tell us about yourself..."
                    style={{ minHeight: '60px' }}
                  />
                </div>
                <div className="profile-edit-actions">
                  <button className="btn btn--primary btn--sm" onClick={saveProfile}>Save</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-header__name-row">
                  <h1 className="profile-header__name">{currentUser.displayName}</h1>
                  <button className="btn btn--ghost btn--sm" onClick={startEditing}>✏️ Edit</button>
                </div>
                <p className="text-muted">@{currentUser.username}</p>
                {currentUser.bio && <p className="profile-header__bio">{currentUser.bio}</p>}
                <div className="profile-header__badges">
                  <span className="badge badge--points">🏆 {currentUser.points} {t('profile.points')}</span>
                  <span className="badge badge--free" style={{ textTransform: 'capitalize' }}>📋 {currentUser.plan}</span>
                  <span className="badge badge--free">👥 {currentUser.friends?.length || 0} {t('profile.friends')}</span>
                </div>
                <p className="text-sm text-muted" style={{ marginTop: '8px' }}>
                  {t('profile.memberSince')} {new Date(currentUser.joinDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="profile-stat-card__value">{myQuestions.length}</span>
            <span className="profile-stat-card__label">Questions Asked</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-card__value">{myAnswers.length}</span>
            <span className="profile-stat-card__label">Answers Given</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-card__value">{myPosts.length}</span>
            <span className="profile-stat-card__label">Social Posts</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-card__value">{loginHistory.length}</span>
            <span className="profile-stat-card__label">Total Logins</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content animate-fade" key={activeTab}>
          {activeTab === 'overview' && (
            <>
              {/* Friends List */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">👥 {t('profile.friends')} ({friends.length})</h2>
                <div className="friends-grid">
                  {friends.length === 0 ? (
                    <p className="text-muted text-sm">No friends yet.</p>
                  ) : (
                    friends.map(f => (
                      <div key={f.id} className="friend-chip">
                        <div className="friend-chip__avatar">{f.displayName.charAt(0)}</div>
                        <div className="friend-chip__info">
                          <span className="friend-chip__name">{f.displayName}</span>
                          <span className="friend-chip__points">{f.points} pts</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">💰 Recent Transactions</h2>
                {transactions.length === 0 ? (
                  <p className="text-muted text-sm">No transactions yet.</p>
                ) : (
                  <div className="transactions-mini">
                    {transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="transaction-mini-item">
                        <span className={`transaction-dot ${tx.type === 'earned' || tx.type === 'received' ? 'transaction-dot--positive' : 'transaction-dot--negative'}`} />
                        <span className="transaction-mini-details">{tx.details}</span>
                        <span className={`transaction-mini-amount ${tx.type === 'earned' || tx.type === 'received' ? 'positive' : 'negative'}`}>
                          {tx.type === 'earned' || tx.type === 'received' ? '+' : '-'}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'people' && (
            <>
              {/* Incoming Friend Requests */}
              {incomingRequests.length > 0 && (
                <div className="card" style={{ marginTop: '16px' }}>
                  <h2 className="section-title">📬 Incoming Requests ({incomingRequests.length})</h2>
                  <div className="people-list">
                    {incomingRequests.map(req => {
                      const fromUser = getUserById(req.from);
                      if (!fromUser) return null;
                      return (
                        <div key={req.from} className="people-card people-card--request animate-fade">
                          <div className="people-card__avatar">{fromUser.displayName.charAt(0)}</div>
                          <div className="people-card__info">
                            <span className="people-card__name">{fromUser.displayName}</span>
                            <span className="people-card__username">@{fromUser.username}</span>
                            <span className="people-card__meta">{fromUser.points} pts · {fromUser.friends?.length || 0} friends</span>
                          </div>
                          <div className="people-card__actions">
                            <button className="btn btn--success btn--sm" onClick={() => handleAcceptRequest(fromUser.id)}>✓ Accept</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleRejectRequest(fromUser.id)}>✕ Decline</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discover People */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">🔍 Discover People</h2>
                <input
                  className="form-input"
                  placeholder="Search users by name or username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ marginBottom: '16px' }}
                  id="search-people"
                />
                <div className="people-list">
                  {filteredUsers.map((user, idx) => {
                    const status = getFriendStatus(user.id);
                    return (
                      <div key={user.id} className="people-card animate-fade" style={{ animationDelay: `${idx * 0.03}s` }}>
                        <div className="people-card__avatar" style={{
                          background: status === 'friend' ? 'var(--so-green)' : '#9FA6AD'
                        }}>{user.displayName.charAt(0)}</div>
                        <div className="people-card__info">
                          <span className="people-card__name">{user.displayName}</span>
                          <span className="people-card__username">@{user.username}</span>
                          <span className="people-card__meta">
                            {user.points} pts · {user.friends?.length || 0} friends
                            {user.plan !== 'free' && <span className="badge badge--free" style={{ marginLeft: '6px', textTransform: 'capitalize' }}>{user.plan}</span>}
                          </span>
                        </div>
                        <div className="people-card__actions">
                          {status === 'none' && (
                            <button className="btn btn--primary btn--sm" onClick={() => handleSendRequest(user.id)}>➕ Add Friend</button>
                          )}
                          {status === 'sent' && (
                            <button className="btn btn--outlined btn--sm" onClick={() => handleCancelRequest(user.id)}>⏳ Cancel</button>
                          )}
                          {status === 'received' && (
                            <>
                              <button className="btn btn--success btn--sm" onClick={() => handleAcceptRequest(user.id)}>✓ Accept</button>
                              <button className="btn btn--ghost btn--sm" onClick={() => handleRejectRequest(user.id)}>✕</button>
                            </>
                          )}
                          {status === 'friend' && (
                            <button className="btn btn--ghost btn--sm people-card__remove" onClick={() => handleRemoveFriend(user.id)}>✕ Remove</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <>
              {/* Questions */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">❓ Your Questions ({myQuestions.length})</h2>
                {myQuestions.length === 0 ? (
                  <p className="text-muted text-sm">You haven't asked any questions yet.</p>
                ) : (
                  <div className="activity-list">
                    {myQuestions.map(q => (
                      <div key={q.id} className="activity-item">
                        <div className="activity-item__icon">📝</div>
                        <div className="activity-item__content">
                          <span className="activity-item__title">{q.title}</span>
                          <span className="activity-item__meta">
                            {q.upvotes - q.downvotes} votes · {q.answers} answers · {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">💬 Your Answers ({myAnswers.length})</h2>
                {myAnswers.length === 0 ? (
                  <p className="text-muted text-sm">You haven't answered any questions yet.</p>
                ) : (
                  <div className="activity-list">
                    {myAnswers.map(a => (
                      <div key={a.id} className="activity-item">
                        <div className="activity-item__icon">💬</div>
                        <div className="activity-item__content">
                          <span className="activity-item__title">{a.body.slice(0, 80)}{a.body.length > 80 ? '...' : ''}</span>
                          <span className="activity-item__meta">{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Posts */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2 className="section-title">📱 Your Social Posts ({myPosts.length})</h2>
                {myPosts.length === 0 ? (
                  <p className="text-muted text-sm">You haven't made any social posts yet.</p>
                ) : (
                  <div className="activity-list">
                    {myPosts.map(p => (
                      <div key={p.id} className="activity-item">
                        <div className="activity-item__icon">📱</div>
                        <div className="activity-item__content">
                          <span className="activity-item__title">{p.content.slice(0, 80)}{p.content.length > 80 ? '...' : ''}</span>
                          <span className="activity-item__meta">
                            {p.likes.length} likes · {p.comments.length} comments · {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="card" style={{ marginTop: '16px' }}>
              <h2 className="section-title">🔐 {t('profile.loginHistory')}</h2>
              {loginHistory.length === 0 ? (
                <p className="text-muted text-sm">{t('profile.noLoginHistory')}</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('profile.browser')}</th>
                        <th>{t('profile.os')}</th>
                        <th>{t('profile.device')}</th>
                        <th>{t('profile.ip')}</th>
                        <th>{t('profile.timestamp')}</th>
                        <th>{t('profile.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.map(record => (
                        <tr key={record.id}>
                          <td>{record.browser}</td>
                          <td>{record.os}</td>
                          <td>{record.deviceType}</td>
                          <td><code style={{ fontSize: '0.78rem' }}>{record.ip}</code></td>
                          <td>{formatIST(record.timestamp)}</td>
                          <td>
                            <span className={`badge ${record.status === 'Success' ? 'badge--free' : 'badge--bronze'}`} style={{ fontSize: '0.68rem' }}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
