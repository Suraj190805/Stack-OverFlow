import React from 'react';

export default function SOLogo({ size = 32 }) {
  const h = size * 1.15;
  return (
    <svg width={size} height={h} viewBox="0 0 32 37" fill="none">
      <path d="M26 33v-9h4v13H0V24h4v9h22Z" fill="#BCBBBB"/>
      <path d="m21.5 0-2.7 2 9.9 13.3 2.7-2L21.5 0ZM26 18.4 13.3 7.8l2.1-2.5 12.7 10.6-2.1 2.5ZM9.1 15.2l15 7 1.4-3-15-7-1.4 3Zm-2 6.9 16.3 3.4.7-3.1-16.3-3.4-.7 3.1ZM7 28.1h16.6v-3.2H7v3.2Z" fill="#F48024"/>
    </svg>
  );
}
