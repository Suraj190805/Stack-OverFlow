import { createContext, useContext, useState, useCallback } from 'react';
import en from '../data/translations/en.json';
import es from '../data/translations/es.json';
import hi from '../data/translations/hi.json';
import pt from '../data/translations/pt.json';
import zh from '../data/translations/zh.json';
import fr from '../data/translations/fr.json';

const LanguageContext = createContext(null);

const TRANSLATIONS = { en, es, hi, pt, zh, fr };

export const LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇺🇸', otpChannel: 'mobile' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸', otpChannel: 'mobile' },
  { code: 'hi', name: 'Hindi',      flag: '🇮🇳', otpChannel: 'mobile' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', otpChannel: 'mobile' },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳', otpChannel: 'mobile' },
  { code: 'fr', name: 'French',     flag: '🇫🇷', otpChannel: 'email'  },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('so_language') || 'en';
  });

  const changeLanguage = useCallback((code) => {
    setLanguage(code);
    localStorage.setItem('so_language', code);
  }, []);

  // Translation function: t('auth.loginTitle') => string
  const t = useCallback((key, replacements = {}) => {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') {
      // Fallback to English
      value = TRANSLATIONS.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    if (typeof value !== 'string') return key;

    // Replace {placeholders}
    let result = value;
    for (const [k, v] of Object.entries(replacements)) {
      result = result.replace(`{${k}}`, v);
    }
    return result;
  }, [language]);

  const getOtpChannel = useCallback((langCode) => {
    const lang = LANGUAGES.find(l => l.code === langCode);
    return lang?.otpChannel || 'mobile';
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, getOtpChannel, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
