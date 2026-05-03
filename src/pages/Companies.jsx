import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Companies.css';

// Mock company data matching SO style
const COMPANIES = [
  {
    id: 1,
    slug: 'jack-henry',
    name: 'Jack Henry & Associates, Inc.',
    verified: true,
    locations: ['Charlotte', 'Louisville', 'Springfield'],
    industries: ['Banking', 'Financial Technology', 'Software Development / Engineering'],
    description: 'According to the team at Jack Henry Digital, people have forgotten how personal banking was before society embraced the digital world. Born from the desire to reconnect institutions with their communities on a human level, the FinTech company developed a suite of digital banking solutions that provid...',
    tags: ['scala', 'go', 'ecmascript-harmony'],
    hasNewContent: true,
    logo: null,
    logoText: 'jh',
    logoColor: '#4A90D9',
  },
  {
    id: 2,
    slug: 'embl-ebi',
    name: "EMBL-EBI (EMBL's European Bioinformatics Institute)",
    verified: false,
    locations: ['Hinxton'],
    industries: ['Big Data', 'Data Science', 'Life Sciences'],
    description: 'EMBL-EBI is a global leader in the storage, analysis and dissemination of large biological datasets. We help scientists realise the potential of big data by enhancing their ability to exploit complex information.',
    tags: ['javascript', 'java', 'angular'],
    hasNewContent: true,
    logo: null,
    logoText: 'EBI',
    logoColor: '#007C82',
  },
  {
    id: 3,
    slug: 'paylocity',
    name: 'Paylocity',
    verified: false,
    locations: ['Bengaluru', 'Praha 8', 'Rochester'],
    industries: ['Human Resources', 'Payroll', 'Software Development / Engineering'],
    description: 'At Paylocity, we are passionate about providing innovative and reliable solutions that empower businesses of all sizes to streamline their HR and payroll processes. Our teams are dedicated to putting our clients first, and we work tirelessly to ensure that our products and services are designed with their...',
    tags: ['aws', 'api-gateway', '.net'],
    hasNewContent: false,
    logo: null,
    logoText: 'P',
    logoColor: '#F97316',
  },
  {
    id: 4,
    slug: 'kvk',
    name: 'KVK',
    verified: false,
    locations: ['Utrecht'],
    industries: ['Government'],
    description: 'Bij KVK werken 600 enthousiaste IT\'ers aan de digitale infrastructuur, vitale systemen die 24/7 blijven draaien zodat ondernemers veilig en verantwoord zaken kunnen doen. De KVK IT infrastructuur is in Nederland net als water uit de kraan: vanzelfsprekend totdat het opdroogt.',
    tags: ['java', 'spring-boot', 'azure'],
    hasNewContent: false,
    logo: null,
    logoText: 'KVK',
    logoColor: '#1B4D9F',
  },
  {
    id: 5,
    slug: 'canonical',
    name: 'Canonical',
    verified: true,
    locations: ['Remote', 'London'],
    industries: ['Open Source', 'Cloud Computing', 'Software Development'],
    description: 'Canonical is the company behind Ubuntu, the leading open-source platform for cloud, IoT and desktop computing. We deliver enterprise security, support and services for Ubuntu users worldwide, and develop technologies that power the future of infrastructure.',
    tags: ['python', 'golang', 'kubernetes'],
    hasNewContent: true,
    logo: null,
    logoText: 'C',
    logoColor: '#E95420',
  },
  {
    id: 6,
    slug: 'twilio',
    name: 'Twilio',
    verified: true,
    locations: ['San Francisco', 'Denver', 'Remote'],
    industries: ['Communications', 'Cloud', 'API Platform'],
    description: 'Twilio powers the future of business communications. Enabling phones, VoIP, and messaging to be embedded into web, desktop, and mobile software. Twilio has democratized communications channels like voice, text, chat, video, and email by virtualizing the world\'s communications infrastructure.',
    tags: ['node.js', 'react', 'python'],
    hasNewContent: false,
    logo: null,
    logoText: 'T',
    logoColor: '#F22F46',
  },
  {
    id: 7,
    slug: 'shopify',
    name: 'Shopify',
    verified: true,
    locations: ['Ottawa', 'Toronto', 'Remote'],
    industries: ['E-commerce', 'SaaS', 'Retail Technology'],
    description: 'Shopify is a leading global commerce company providing trusted tools to start, grow, market, and manage a retail business of any size. Shopify makes commerce better for everyone with a platform and services that are engineered for reliability while delivering a better shopping experience.',
    tags: ['ruby', 'react', 'graphql'],
    hasNewContent: true,
    logo: null,
    logoText: 'S',
    logoColor: '#96BF48',
  },
  {
    id: 8,
    slug: 'stripe',
    name: 'Stripe',
    verified: true,
    locations: ['San Francisco', 'Dublin', 'Singapore'],
    industries: ['Fintech', 'Payments', 'Developer Tools'],
    description: 'Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.',
    tags: ['ruby', 'scala', 'typescript'],
    hasNewContent: false,
    logo: null,
    logoText: 'S',
    logoColor: '#635BFF',
  },
  {
    id: 9,
    slug: 'hashicorp',
    name: 'HashiCorp',
    verified: false,
    locations: ['San Francisco', 'Remote'],
    industries: ['Cloud Infrastructure', 'DevOps', 'Security'],
    description: 'HashiCorp provides a suite of open-source tools for provisioning, securing, connecting, and running cloud infrastructure. Our products include Terraform, Vault, Consul, and Nomad, empowering teams to manage multi-cloud environments with consistent workflows.',
    tags: ['golang', 'terraform', 'docker'],
    hasNewContent: false,
    logo: null,
    logoText: 'H',
    logoColor: '#000',
  },
  {
    id: 10,
    slug: 'atlassian',
    name: 'Atlassian',
    verified: true,
    locations: ['Sydney', 'San Francisco', 'Bengaluru'],
    industries: ['SaaS', 'Collaboration', 'Developer Tools'],
    description: 'Atlassian builds software for teams. From Jira to Confluence, Trello to Bitbucket, our products help teams organize, discuss, and complete shared work. Over 300,000 companies worldwide, including NASA, Tesla, and Netflix, rely on Atlassian.',
    tags: ['java', 'react', 'typescript'],
    hasNewContent: true,
    logo: null,
    logoText: 'A',
    logoColor: '#0052CC',
  },
];

export default function Companies() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [searchAll, setSearchAll] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  if (!currentUser) return <Navigate to="/login" />;

  const filtered = useMemo(() => {
    let list = [...COMPANIES];

    if (searchAll.trim()) {
      const q = searchAll.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(tag => tag.toLowerCase().includes(q)) ||
        c.industries.some(i => i.toLowerCase().includes(q))
      );
    }

    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      list = list.filter(c =>
        c.locations.some(l => l.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchAll, searchLocation]);

  return (
    <div className="companies-page">
      <h1 className="companies-page__title">{t('companies.title')}</h1>
      <p className="companies-page__subtitle">{t('companies.subtitle')}</p>

      {/* Search Row */}
      <div className="companies-page__search-row">
        <div className="companies-page__search">
          <svg className="companies-page__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="companies-page__search-input"
            placeholder={t('companies.searchAll')}
            value={searchAll}
            onChange={(e) => setSearchAll(e.target.value)}
          />
        </div>
        <div className="companies-page__location">
          <input
            type="text"
            className="companies-page__location-input"
            placeholder={t('companies.searchLocation')}
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>
        <button className="companies-page__search-btn">{t('companies.search')}</button>
        <button className="companies-page__filter-btn">
          {t('companies.filterByTag')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Company List */}
      {filtered.length === 0 ? (
        <div className="companies-page__empty">
          {searchAll || searchLocation ? t('companies.noResultsMatching') : t('companies.noResults')}
        </div>
      ) : (
        <div className="companies-list">
          {filtered.map(company => (
            <div key={company.id} className="company-card">
              {/* Logo */}
              <div
                className="company-card__logo"
                style={{ background: company.logoColor }}
              >
                {company.logo ? (
                  <img src={company.logo} alt={company.name} />
                ) : (
                  company.logoText
                )}
              </div>

              {/* Info */}
              <div className="company-card__info">
                <div className="company-card__name-row">
                  <Link to={`/companies/${company.slug}`} className="company-card__name">
                    {company.name}
                  </Link>
                  {company.verified && (
                    <span className="company-card__verified" title="Verified">●</span>
                  )}
                </div>

                <div className="company-card__meta">
                  <span className="company-card__meta-item">
                    <svg className="company-card__meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {company.locations.join('; ')}
                  </span>
                  <span className="company-card__meta-item">
                    <svg className="company-card__meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                    {company.industries.join(', ')}
                  </span>
                </div>

                <p className="company-card__description">{company.description}</p>

                <div className="company-card__tags">
                  {company.tags.map(tag => (
                    <span key={tag} className="company-card__tag">{tag}</span>
                  ))}
                  {company.hasNewContent && (
                    <span className="company-card__new-badge">{t('companies.newContent')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
