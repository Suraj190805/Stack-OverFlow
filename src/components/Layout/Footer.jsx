import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SOLogo from '../common/SOLogo';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="so-footer" id="footer">
      <div className="so-footer__inner">
        <div className="so-footer__logo">
          <SOLogo size={32} />
        </div>

        <nav className="so-footer__columns">
          <div className="so-footer__column">
            <h5 className="so-footer__column-title">{t('footer.stackOverflow')}</h5>
            <ul>
              <li><Link to="/dashboard">{t('footer.questions')}</Link></li>
              <li><Link to="/ask">{t('footer.ask')}</Link></li>
              <li><a href="#">{t('footer.help')}</a></li>
            </ul>
          </div>
          <div className="so-footer__column">
            <h5 className="so-footer__column-title">{t('footer.products')}</h5>
            <ul>
              <li><Link to="/subscription">{t('footer.teams')}</Link></li>
              <li><a href="#">{t('footer.advertising')}</a></li>
              <li><a href="#">{t('footer.talent')}</a></li>
            </ul>
          </div>
          <div className="so-footer__column">
            <h5 className="so-footer__column-title">{t('footer.company')}</h5>
            <ul>
              <li><a href="#">{t('footer.about')}</a></li>
              <li><a href="#">{t('footer.press')}</a></li>
              <li><a href="#">{t('footer.legal')}</a></li>
              <li><a href="#">{t('footer.privacyPolicy')}</a></li>
              <li><a href="#">{t('footer.termsOfService')}</a></li>
            </ul>
          </div>
          <div className="so-footer__column">
            <h5 className="so-footer__column-title">{t('footer.stackExchange')}</h5>
            <ul>
              <li><a href="#">{t('footer.technology')}</a></li>
              <li><a href="#">{t('footer.cultureRecreation')}</a></li>
              <li><a href="#">{t('footer.lifeArts')}</a></li>
              <li><a href="#">{t('footer.science')}</a></li>
              <li><a href="#">{t('footer.professional')}</a></li>
            </ul>
          </div>
        </nav>

        <div className="so-footer__socials">
          <div className="so-footer__social-links">
            <a href="#" aria-label="Blog">Blog</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
            <a href="#" aria-label="Instagram">Instagram</a>
          </div>
          <p className="so-footer__copyright">
            {t('footer.copyright')}{' '}
            <a href="#"> CC BY-SA</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
