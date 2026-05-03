import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../contexts/PointsContext';
import { useToast } from '../contexts/ToastContext';
import './Rewards.css';

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 600;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    animate();
    prevValue.current = value;
  }, [value]);

  return <span className="animated-counter">{display}</span>;
}

function Confetti({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#F48024', '#0A95FF', '#2EA043', '#FFD700', '#F85149', '#58A6FF'][i % 6],
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="confetti-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Rewards() {
  const { currentUser, searchUsers } = useAuth();
  const { t } = useLanguage();
  const { transferPoints, getUserTransactions } = usePoints();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  if (!currentUser) return <Navigate to="/login" />;

  const transactions = getUserTransactions(currentUser.id);

  // Async search handler
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedUser(null);
    if (query.length > 1) {
      try {
        const results = await searchUsers(query);
        setSearchResults((results || []).filter(u => u._id !== currentUser._id));
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    const result = await transferPoints(currentUser.id, selectedUser._id, amount);
    if (result.success) {
      toast.success(t('rewards.transferSuccess', { points: amount, user: selectedUser.displayName }));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      setSelectedUser(null);
      setTransferAmount('');
      setSearchQuery('');
      setSearchResults([]);
    } else {
      toast.error(result.error);
    }
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

  const earned = transactions.filter(tx => tx.type === 'earned' || tx.type === 'received').reduce((s, tx) => s + tx.amount, 0);
  const spent = transactions.filter(tx => tx.type === 'deducted' || tx.type === 'transferred').reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="page-wrapper">
      <Confetti active={showConfetti} />
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="page-title">{t('rewards.title')}</h1>

        {/* Points Balance Card */}
        <div className="points-balance-card">
          <div className="points-balance-card__glow" />
          <div className="points-balance__label">{t('rewards.currentBalance')}</div>
          <div className="points-balance__value">
            <AnimatedCounter value={currentUser.points} />
          </div>
          <div className="points-balance__unit">{t('profile.points')}</div>
          <div className="points-balance__stats">
            <div className="points-mini-stat">
              <span className="points-mini-stat__value positive">+{earned}</span>
              <span className="points-mini-stat__label">Earned</span>
            </div>
            <div className="points-mini-stat__divider" />
            <div className="points-mini-stat">
              <span className="points-mini-stat__value negative">-{spent}</span>
              <span className="points-mini-stat__label">Spent</span>
            </div>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="card transfer-card" style={{ marginTop: '20px' }}>
          <h2 className="section-title">💸 {t('rewards.transferPoints')}</h2>

          {currentUser.points <= 10 && (
            <div className="alert alert--warning" style={{ marginBottom: '16px' }}>
              {t('rewards.needMorePoints')}
            </div>
          )}

          <div className="transfer-form">
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">{t('rewards.searchUser')}</label>
              <input
                className="form-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t('common.search')}
                disabled={currentUser.points <= 10}
              />
              {searchResults.length > 0 && !selectedUser && (
                <div className="search-dropdown">
                  {searchResults.map(u => (
                    <button
                      key={u._id}
                      className="search-dropdown__item"
                      onClick={() => { setSelectedUser(u); setSearchQuery(u.displayName); setSearchResults([]); }}
                    >
                      <div className="search-dropdown__avatar">{u.displayName.charAt(0)}</div>
                      <div>
                        <div>{u.displayName}</div>
                        <div className="text-muted text-sm">@{u.username} · {u.points} pts</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="selected-user-chip animate-fade">
                <span>Sending to: <strong>{selectedUser.displayName}</strong> (@{selectedUser.username})</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('rewards.pointsToTransfer')}</label>
              <input
                type="number"
                className="form-input"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                min={1}
                max={currentUser.points}
                placeholder="0"
                disabled={currentUser.points <= 10 || !selectedUser}
              />
            </div>

            <button
              className="btn btn--primary btn--full transfer-btn"
              onClick={handleTransfer}
              disabled={currentUser.points <= 10 || !selectedUser || !transferAmount}
            >
              💸 {t('rewards.transfer')}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card" style={{ marginTop: '16px' }}>
          <h2 className="section-title">📋 {t('profile.transactionHistory')}</h2>
          {transactions.length === 0 ? (
            <p className="text-muted text-sm">No transactions yet.</p>
          ) : (
            <div className="transactions-list">
              {transactions.map(tx => (
                <div key={tx.id} className="transaction-item">
                  <span className="transaction-icon">{getTransactionIcon(tx.type)}</span>
                  <div className="transaction-info">
                    <span className="transaction-details">{tx.details}</span>
                    <span className="transaction-time">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                  <span className={`transaction-amount ${tx.type === 'earned' || tx.type === 'received' ? 'positive' : 'negative'}`}>
                    {tx.type === 'earned' || tx.type === 'received' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
