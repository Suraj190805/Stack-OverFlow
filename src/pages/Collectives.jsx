import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Collectives.css';

// Collectives data matching official SO
const COLLECTIVES_DATA = [
  {
    id: 'aws',
    name: 'AWS',
    slug: 'aws',
    logo: 'aws',
    logoColor: '#FF9900',
    logoBg: '#232F3E',
    members: 39000,
    questions: 412000,
    answers: 186000,
    description: 'A collective for developers who utilize Amazon Web Services\' infrastructure and platform capabilities to build reliable, scalable, and cost-effective applications.',
    tags: ['amazon-web-services', 'aws-lambda', 'amazon-s3', 'amazon-ec2', 'amazon-dynamodb'],
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    slug: 'ci-cd',
    logo: 'CI/',
    logoColor: '#fff',
    logoBg: '#6366F1',
    members: 24000,
    questions: 89000,
    answers: 42000,
    description: 'A collective where developers focused on continuous integration, delivery, and deployment share knowledge and best practices for modern DevOps workflows.',
    tags: ['continuous-integration', 'jenkins', 'github-actions', 'gitlab-ci', 'docker'],
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    slug: 'google-cloud',
    logo: 'G',
    logoColor: '#fff',
    logoBg: '#4285F4',
    members: 68000,
    questions: 285000,
    answers: 124000,
    description: 'A collective for developers who utilize Google Cloud\'s infrastructure and platform capabilities to build reliable, scalable, and efficient applications.',
    tags: ['google-cloud-platform', 'firebase', 'google-bigquery', 'google-kubernetes-engine', 'gcloud'],
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    slug: 'microsoft-azure',
    logo: 'Az',
    logoColor: '#fff',
    logoBg: '#0078D4',
    members: 31000,
    questions: 195000,
    answers: 87000,
    description: 'A collective for developers to engage, share, and learn about Microsoft Azure\'s open-source technologies, cloud services, and developer tools.',
    tags: ['azure', 'azure-devops', 'azure-functions', 'azure-active-directory', 'azure-storage'],
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    slug: 'mobile-development',
    logo: 'MD',
    logoColor: '#fff',
    logoBg: '#06B6D4',
    members: 29000,
    questions: 524000,
    answers: 231000,
    description: 'A collective for developers who want to share their knowledge and learn more about mobile development including iOS, Android, and cross-platform frameworks.',
    tags: ['android', 'ios', 'react-native', 'flutter', 'swift'],
  },
  {
    id: 'nlp',
    name: 'NLP',
    slug: 'nlp',
    logo: 'NLP',
    logoColor: '#fff',
    logoBg: '#8B5CF6',
    members: 13000,
    questions: 72000,
    answers: 35000,
    description: 'A collective focused on NLP (natural language processing), the transformation or extraction of useful information from natural language data using computational methods.',
    tags: ['nlp', 'natural-language-processing', 'spacy', 'nltk', 'text-mining'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    slug: 'openai',
    logo: '◉',
    logoColor: '#fff',
    logoBg: '#10A37F',
    members: 2000,
    questions: 18000,
    answers: 7500,
    description: 'A collective for developers utilizing OpenAI\'s foundational models and APIs to build, integrate, and innovate with cutting-edge AI technologies.',
    tags: ['openai-api', 'chatgpt-api', 'gpt-4', 'dall-e', 'whisper'],
  },
  {
    id: 'php',
    name: 'PHP',
    slug: 'php',
    logo: 'PHP',
    logoColor: '#fff',
    logoBg: '#777BB4',
    members: 18000,
    questions: 1420000,
    answers: 890000,
    description: 'A collective where developers working with PHP can learn and connect about the open source server-side scripting language, frameworks, and ecosystem.',
    tags: ['php', 'laravel', 'symfony', 'wordpress', 'composer-php'],
  },
  {
    id: 'r-language',
    name: 'R Language',
    slug: 'r-language',
    logo: 'R',
    logoColor: '#fff',
    logoBg: '#276DC3',
    members: 16000,
    questions: 478000,
    answers: 312000,
    description: 'A collective where data scientists and AI researchers gather to find, share, and learn about R and other topics related to statistical computing and data visualization.',
    tags: ['r', 'ggplot2', 'dplyr', 'shiny', 'tidyverse'],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    slug: 'twilio',
    logo: 'T',
    logoColor: '#fff',
    logoBg: '#F22F46',
    members: 8000,
    questions: 28000,
    answers: 14000,
    description: 'A collective for developers building communication solutions with Twilio\'s cloud communications platform including voice, SMS, video, and authentication APIs.',
    tags: ['twilio', 'twilio-api', 'sendgrid', 'twilio-programmable-chat'],
  },
  {
    id: 'wso2',
    name: 'WSO2',
    slug: 'wso2',
    logo: 'W',
    logoColor: '#fff',
    logoBg: '#FF7300',
    members: 5000,
    questions: 12000,
    answers: 6500,
    description: 'A collective for developers using WSO2\'s open-source middleware solutions for API management, integration, identity management, and analytics.',
    tags: ['wso2', 'wso2-api-manager', 'ballerina', 'wso2-identity-server'],
  },
  {
    id: 'go',
    name: 'Go Language',
    slug: 'go-language',
    logo: 'Go',
    logoColor: '#fff',
    logoBg: '#00ADD8',
    members: 22000,
    questions: 86000,
    answers: 52000,
    description: 'A collective for developers working with Go, Google\'s open-source programming language designed for simplicity, reliability, and efficiency.',
    tags: ['go', 'goroutine', 'golang', 'gin', 'go-modules'],
  },
];

export default function Collectives() {
  const toast = useToast();
  const { t } = useLanguage();
  const [joinedCollectives, setJoinedCollectives] = useLocalStorage('so_joined_collectives', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return n.toString();
  };

  const isJoined = (id) => joinedCollectives.includes(id);

  const handleToggleJoin = (collective) => {
    if (isJoined(collective.id)) {
      setJoinedCollectives(prev => prev.filter(id => id !== collective.id));
      toast.info(`Left ${collective.name}`);
    } else {
      setJoinedCollectives(prev => [...prev, collective.id]);
      toast.success(`Joined ${collective.name}! 🎉`);
    }
  };

  const displayedCollectives = useMemo(() => {
    let result = [...COLLECTIVES_DATA];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'recommended':
        // Show joined first, then by members
        result.sort((a, b) => {
          const aJoined = isJoined(a.id) ? 1 : 0;
          const bJoined = isJoined(b.id) ? 1 : 0;
          if (bJoined !== aJoined) return bJoined - aJoined;
          return b.members - a.members;
        });
        break;
      case 'most-members':
        result.sort((a, b) => b.members - a.members);
        break;
      case 'most-questions':
        result.sort((a, b) => b.questions - a.questions);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy, joinedCollectives]);

  return (
    <div className="collectives-page" id="collectives-page">
      {/* Header */}
      <div className="collectives-page__header">
        <h1 className="collectives-page__title">{t('collectives.title')}</h1>
        <p className="collectives-page__subtitle">
          {t('collectives.subtitle')}
        </p>
        <div className="collectives-page__actions">
          <button
            className="collectives-page__learn-btn"
            onClick={() => setShowInfoModal(true)}
          >
            {t('collectives.learnMore')}
          </button>
          <span className="collectives-page__help-link" onClick={() => setShowInfoModal(true)}>
            <span className="collectives-page__help-icon">?</span>
            {t('collectives.lookingForHelp')}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="collectives-filter">
        <div className="collectives-filter__search">
          <svg className="collectives-filter__search-icon" width="14" height="14" viewBox="0 0 14 14">
            <path d="M10.5 9.1l3.4 3.4-1.4 1.4-3.4-3.4a5.5 5.5 0 1 1 1.4-1.4ZM6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor"/>
          </svg>
          <input
            className="collectives-filter__search-input"
            type="text"
            placeholder={t('collectives.filterPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="collectives-filter__sort">
          {[
            { key: 'recommended', label: t('collectives.recommended') },
            { key: 'most-members', label: t('collectives.mostMembers') },
            { key: 'most-questions', label: t('collectives.mostQuestions') },
            { key: 'alphabetical', label: t('collectives.az') },
          ].map(s => (
            <button
              key={s.key}
              className={`collectives-filter__sort-btn ${sortBy === s.key ? 'collectives-filter__sort-btn--active' : ''}`}
              onClick={() => setSortBy(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="collectives-grid">
        {displayedCollectives.length === 0 ? (
          <div className="collectives-empty">
            <div className="collectives-empty__icon">🔍</div>
            <h2 className="collectives-empty__title">{t('collectives.noResults')}</h2>
            <p className="collectives-empty__text">
              {t('collectives.noResultsHint')}
            </p>
          </div>
        ) : (
          displayedCollectives.map((c, index) => (
            <div
              className="collective-card"
              key={c.id}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="collective-card__top">
                <div className="collective-card__identity">
                  <div
                    className="collective-card__logo"
                    style={{ background: c.logoBg, color: c.logoColor }}
                  >
                    {c.logo}
                  </div>
                  <div className="collective-card__info">
                    <span className="collective-card__name">{c.name}</span>
                    <span className="collective-card__members">
                      {formatCount(c.members)} {t('collectives.members')}
                    </span>
                  </div>
                </div>
                <button
                  className={`collective-card__join-btn ${isJoined(c.id) ? 'collective-card__join-btn--joined' : ''}`}
                  onClick={() => handleToggleJoin(c)}
                >
                  {isJoined(c.id) ? t('collectives.joined') : t('collectives.join')}
                </button>
              </div>

              <p className="collective-card__desc">{c.description}</p>

              <div className="collective-card__tags">
                {c.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="s-tag">{tag}</span>
                ))}
                {c.tags.length > 3 && (
                  <span className="s-tag" style={{ opacity: 0.6 }}>
                    {t('collectives.more', { count: c.tags.length - 3 })}
                  </span>
                )}
              </div>

              <div className="collective-card__stats">
                <div className="collective-card__stat">
                  <span className="collective-card__stat-value">{formatCount(c.questions)}</span>
                  {t('collectives.questions')}
                </div>
                <div className="collective-card__stat">
                  <span className="collective-card__stat-value">{formatCount(c.answers)}</span>
                  {t('collectives.answers')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="collectives-modal" onClick={() => setShowInfoModal(false)}>
          <div className="collectives-modal__content" onClick={e => e.stopPropagation()}>
            <button className="collectives-modal__close" onClick={() => setShowInfoModal(false)}>
              ✕
            </button>
            <h2 className="collectives-modal__title">{t('collectives.whatAreCollectives')}</h2>
            <div className="collectives-modal__body">
              <p>
                {t('collectives.collectivesExplanation')}
              </p>

              <h3>{t('collectives.keyFeatures')}</h3>
              <ul>
                <li><strong>{t('collectives.recognizedContent')}</strong> {t('collectives.recognizedContentDesc')}</li>
                <li><strong>{t('collectives.articles')}</strong> {t('collectives.articlesDesc')}</li>
                <li><strong>{t('collectives.bulletins')}</strong> {t('collectives.bulletinsDesc')}</li>
                <li><strong>{t('collectives.communityDiscussions')}</strong> {t('collectives.communityDiscussionsDesc')}</li>
              </ul>

              <h3>{t('collectives.benefitsOfJoining')}</h3>
              <ul>
                <li>{t('collectives.benefit1')}</li>
                <li>{t('collectives.benefit2')}</li>
                <li>{t('collectives.benefit3')}</li>
                <li>{t('collectives.benefit4')}</li>
                <li>{t('collectives.benefit5')}</li>
              </ul>

              <h3>{t('collectives.howToParticipate')}</h3>
              <p>
                {t('collectives.participateDesc')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
