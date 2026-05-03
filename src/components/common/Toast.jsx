import React, { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 400);
    const closeTimer = setTimeout(onClose, duration);
    return () => { clearTimeout(exitTimer); clearTimeout(closeTimer); };
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    points: '🏆',
  };

  return (
    <div className={`toast-notification toast-notification--${type} ${isExiting ? 'toast-notification--exit' : ''}`}>
      <span className="toast-notification__icon">{icons[type] || icons.info}</span>
      <span className="toast-notification__message">{message}</span>
      <button className="toast-notification__close" onClick={onClose}>✕</button>
    </div>
  );
}
