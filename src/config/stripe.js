/**
 * Stripe Configuration
 * ─────────────────────────────────────────────
 * Uses Stripe's official test publishable key.
 * Replace with your own key from https://dashboard.stripe.com/apikeys
 *
 * Test card numbers:
 *   ✓ Success:       4242 4242 4242 4242
 *   ✗ Declined:      4000 0000 0000 0002
 *   🔒 3D Secure:    4000 0025 0000 3155
 *   ⚠ Insufficient:  4000 0000 0000 9995
 */

import { loadStripe } from '@stripe/stripe-js';

// ── Publishable Key (from .env) ──────────────────────────────────
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Lazy-loaded Stripe instance (loads Stripe.js from CDN once)
let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// ── Stripe Element Appearance ────────────────────────────────────
// Matches our checkout UI design system
export const STRIPE_ELEMENT_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#635bff',
    colorBackground: '#ffffff',
    colorText: '#1a1a2e',
    colorDanger: '#df1b41',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizeBase: '14px',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
  rules: {
    '.Input': {
      border: '1px solid #d9d9d9',
      boxShadow: 'none',
      padding: '10px 12px',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    '.Input:focus': {
      borderColor: '#635bff',
      boxShadow: '0 0 0 3px rgba(99, 91, 255, 0.12)',
    },
    '.Input--invalid': {
      borderColor: '#df1b41',
      boxShadow: '0 0 0 3px rgba(223, 27, 65, 0.08)',
    },
    '.Label': {
      fontWeight: '600',
      fontSize: '13px',
      color: '#1a1a2e',
      marginBottom: '6px',
    },
    '.Error': {
      fontSize: '12px',
      color: '#df1b41',
    },
  },
};

// ── Individual Element Styles ────────────────────────────────────
// Used for CardNumberElement, CardExpiryElement, CardCvcElement
export const STRIPE_ELEMENT_STYLE = {
  base: {
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '::placeholder': {
      color: '#a3a3a3',
    },
    letterSpacing: '0.5px',
  },
  invalid: {
    color: '#df1b41',
    iconColor: '#df1b41',
  },
  complete: {
    color: '#2f6f44',
    iconColor: '#2f6f44',
  },
};

// ── Stripe Price IDs (from .env) ─────────────────────────
// Maps plan names to their Stripe Price IDs for checkout
export const STRIPE_PRICE_IDS = {
  bronze: import.meta.env.VITE_STRIPE_PRICE_BRONZE || '',
  silver: import.meta.env.VITE_STRIPE_PRICE_SILVER || '',
  gold:   import.meta.env.VITE_STRIPE_PRICE_GOLD   || '',
};

export default {
  getStripe,
  STRIPE_ELEMENT_APPEARANCE,
  STRIPE_ELEMENT_STYLE,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICE_IDS,
};
