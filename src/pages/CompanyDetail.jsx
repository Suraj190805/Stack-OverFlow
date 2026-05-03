import React, { useState, useMemo } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CompanyDetail.css';

// Full company data — shared with Companies.jsx
const COMPANIES_DATA = {
  'jack-henry': {
    id: 1,
    name: 'Jack Henry & Associates, Inc.®',
    slug: 'jack-henry',
    verified: true,
    logoText: 'jh',
    logoColor: '#4A90D9',
    tagline: 'Jack Henry is a well-rounded financial technology company that strengthens the connections between people and their financial institutions.',
    website: 'jackhenry.com',
    industry: 'Banking, Financial Technology, Software Development / Engineering',
    size: '5k-10k employees',
    founded: '1976',
    status: 'Public',
    followers: 435,
    locations: ['Charlotte', 'Louisville', 'Springfield'],
    techStack: ['scala', 'go', 'ecmascript-harmony', 'java', 'spring-boot', 'react', 'aws', 'docker', 'kubernetes', 'postgresql'],
    about: `Jack Henry & Associates, Inc.® (NASDAQ: JKHY) is a leading SaaS provider primarily for the financial services industry. Jack Henry provides technology solutions and payment processing services primarily for financial services organizations.

The company's mission is to strengthen the connections between people and their financial institutions through innovation and collaboration. With a commitment to openness, collaboration, and user centricity, they offer platforms designed to empower community and regional financial institutions.

Founded in 1976, the company serves more than 7,500 clients across the U.S. and employs over 7,000 associates who are committed to the company's culture of service.`,
    updates: [
      {
        id: 1,
        time: 'yesterday',
        content: 'Our 2026 Sustainability Report is now available! 🎉🌍💡\n\nExplore the report to learn more about how we are delivering on our commitments to people, communities, responsible business practices, and the planet.\n\nRead the full report.',
        hasImage: true,
        imageLabel: '2026 Sustainability Report',
      },
      {
        id: 2,
        time: '3 days ago',
        content: 'We\'re thrilled to announce that Jack Henry has been named a Top Workplace for Innovation by Energage! This recognition reflects our team\'s dedication to building technology that transforms how community financial institutions serve their customers.',
        hasImage: false,
      },
      {
        id: 3,
        time: '1 week ago',
        content: 'Join us at our annual Tech Summit in Nashville! Connect with industry leaders, explore cutting-edge fintech solutions, and discover how Jack Henry is shaping the future of financial services. Register today at the link below.',
        hasImage: true,
        imageLabel: 'Tech Summit 2026',
      },
    ],
    photos: [
      { label: 'jack henry 50 years', color: 'linear-gradient(135deg, #1a365d, #2d6cb4)' },
      { label: 'Team at HQ', color: 'linear-gradient(135deg, #2d6cb4, #4A90D9)' },
    ],
  },
  'embl-ebi': {
    id: 2,
    name: "EMBL-EBI (EMBL's European Bioinformatics Institute)",
    slug: 'embl-ebi',
    verified: false,
    logoText: 'EBI',
    logoColor: '#007C82',
    tagline: 'EMBL-EBI is a global leader in the storage, analysis and dissemination of large biological datasets.',
    website: 'ebi.ac.uk',
    industry: 'Big Data, Data Science, Life Sciences',
    size: '500-1k employees',
    founded: '1992',
    status: 'Research Institute',
    followers: 312,
    locations: ['Hinxton, UK'],
    techStack: ['javascript', 'java', 'angular', 'python', 'react', 'spring', 'postgresql', 'mongodb', 'docker'],
    about: `EMBL-EBI is part of the European Molecular Biology Laboratory, an intergovernmental research organisation funded by over 20 member states. They provide freely available data from life science experiments, perform basic research in computational biology, and offer training in bioinformatics to scientists across the globe.`,
    updates: [
      { id: 1, time: '2 days ago', content: 'New release of our protein structure prediction database! Over 200 million structures now freely available to researchers worldwide. 🧬', hasImage: false },
      { id: 2, time: '1 week ago', content: 'We are hiring bioinformaticians! Check out our open positions and join a world-class team of researchers and engineers.', hasImage: false },
    ],
    photos: [{ label: 'EMBL-EBI Campus', color: 'linear-gradient(135deg, #007C82, #00A896)' }],
  },
  'paylocity': {
    id: 3,
    name: 'Paylocity',
    slug: 'paylocity',
    verified: false,
    logoText: 'P',
    logoColor: '#F97316',
    tagline: 'Innovative and reliable solutions that empower businesses to streamline their HR and payroll processes.',
    website: 'paylocity.com',
    industry: 'Human Resources, Payroll, Software Development / Engineering',
    size: '5k-10k employees',
    founded: '1997',
    status: 'Public',
    followers: 289,
    locations: ['Bengaluru', 'Praha 8', 'Rochester'],
    techStack: ['aws', 'api-gateway', '.net', 'c#', 'react', 'sql-server', 'kubernetes', 'terraform'],
    about: `Paylocity is a leading provider of cloud-based payroll and human capital management software solutions. They deliver a comprehensive platform that helps businesses manage the complete employee lifecycle.`,
    updates: [
      { id: 1, time: '5 days ago', content: 'Paylocity named a Leader in the Gartner Magic Quadrant for Cloud HCM Suites! We continue to innovate and deliver solutions that matter.', hasImage: false },
    ],
    photos: [{ label: 'Office Culture', color: 'linear-gradient(135deg, #F97316, #FB923C)' }],
  },
  'canonical': {
    id: 5,
    name: 'Canonical',
    slug: 'canonical',
    verified: true,
    logoText: 'C',
    logoColor: '#E95420',
    tagline: 'The company behind Ubuntu — the leading open-source platform for cloud, IoT and desktop computing.',
    website: 'canonical.com',
    industry: 'Open Source, Cloud Computing, Software Development',
    size: '500-1k employees',
    founded: '2004',
    status: 'Private',
    followers: 1243,
    locations: ['Remote', 'London'],
    techStack: ['python', 'golang', 'kubernetes', 'juju', 'lxd', 'snap', 'flutter', 'react', 'postgresql'],
    about: `Canonical is the publisher of Ubuntu, the OS for most public cloud workloads as well as the emerging categories of smart gateways, self-driving cars and advanced robots. Canonical provides enterprise security, support and services for commercial users of Ubuntu.`,
    updates: [
      { id: 1, time: '1 day ago', content: 'Ubuntu 26.04 LTS is here! 🚀 Our latest Long Term Support release brings performance improvements, enhanced security, and new developer tools.', hasImage: true, imageLabel: 'Ubuntu 26.04 LTS' },
      { id: 2, time: '4 days ago', content: 'We\'re hiring remotely! Join our distributed team building the future of open source infrastructure. Engineering, product, and design roles available.', hasImage: false },
    ],
    photos: [{ label: 'Ubuntu Community', color: 'linear-gradient(135deg, #E95420, #772953)' }],
  },
  'twilio': {
    id: 6,
    name: 'Twilio',
    slug: 'twilio',
    verified: true,
    logoText: 'T',
    logoColor: '#F22F46',
    tagline: 'Twilio powers the future of business communications with APIs for voice, messaging, and video.',
    website: 'twilio.com',
    industry: 'Communications, Cloud, API Platform',
    size: '5k-10k employees',
    founded: '2008',
    status: 'Public',
    followers: 2150,
    locations: ['San Francisco', 'Denver', 'Remote'],
    techStack: ['node.js', 'react', 'python', 'java', 'go', 'aws', 'redis', 'kafka'],
    about: `Twilio has democratized communications channels like voice, text, chat, video, and email by virtualizing the world's communications infrastructure through APIs that are simple enough for any developer to use.`,
    updates: [
      { id: 1, time: '2 days ago', content: 'Introducing Twilio AI Assistants — build intelligent, conversational experiences across every channel. Now in public beta!', hasImage: false },
    ],
    photos: [{ label: 'Twilio Signal Conference', color: 'linear-gradient(135deg, #F22F46, #CF1124)' }],
  },
  'shopify': {
    id: 7,
    name: 'Shopify',
    slug: 'shopify',
    verified: true,
    logoText: 'S',
    logoColor: '#96BF48',
    tagline: 'Shopify makes commerce better for everyone with a platform engineered for reliability.',
    website: 'shopify.com',
    industry: 'E-commerce, SaaS, Retail Technology',
    size: '10k+ employees',
    founded: '2006',
    status: 'Public',
    followers: 3800,
    locations: ['Ottawa', 'Toronto', 'Remote'],
    techStack: ['ruby', 'react', 'graphql', 'rust', 'go', 'typescript', 'kubernetes', 'mysql'],
    about: `Shopify is a leading global commerce company providing trusted tools to start, grow, market, and manage a retail business of any size. Millions of merchants in 175+ countries rely on Shopify.`,
    updates: [
      { id: 1, time: '1 day ago', content: 'Shopify Editions — our biggest product update of the year is here! Over 150 new features to help merchants sell more everywhere. 🛒✨', hasImage: true, imageLabel: 'Shopify Editions 2026' },
    ],
    photos: [{ label: 'Shopify HQ', color: 'linear-gradient(135deg, #96BF48, #5C8A1E)' }],
  },
  'stripe': {
    id: 8,
    name: 'Stripe',
    slug: 'stripe',
    verified: true,
    logoText: 'S',
    logoColor: '#635BFF',
    tagline: 'Financial infrastructure for the internet — payments, billing, and beyond.',
    website: 'stripe.com',
    industry: 'Fintech, Payments, Developer Tools',
    size: '5k-10k employees',
    founded: '2010',
    status: 'Private',
    followers: 4200,
    locations: ['San Francisco', 'Dublin', 'Singapore'],
    techStack: ['ruby', 'scala', 'typescript', 'react', 'go', 'java', 'aws', 'kubernetes'],
    about: `Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use Stripe to accept payments and manage their businesses online.`,
    updates: [
      { id: 1, time: '3 days ago', content: 'Stripe Dashboard v3 is here — a complete redesign with real-time analytics, AI-powered insights, and a faster workflow for managing your business.', hasImage: false },
    ],
    photos: [{ label: 'Stripe Sessions', color: 'linear-gradient(135deg, #635BFF, #4840CC)' }],
  },
  'hashicorp': {
    id: 9,
    name: 'HashiCorp',
    slug: 'hashicorp',
    verified: false,
    logoText: 'H',
    logoColor: '#000',
    tagline: 'Consistent workflows for provisioning, securing, connecting, and running cloud infrastructure.',
    website: 'hashicorp.com',
    industry: 'Cloud Infrastructure, DevOps, Security',
    size: '1k-5k employees',
    founded: '2012',
    status: 'Public',
    followers: 1890,
    locations: ['San Francisco', 'Remote'],
    techStack: ['golang', 'terraform', 'docker', 'vault', 'consul', 'nomad', 'react', 'typescript'],
    about: `HashiCorp provides a suite of open-source tools for provisioning, securing, connecting, and running cloud infrastructure including Terraform, Vault, Consul, and Nomad.`,
    updates: [
      { id: 1, time: '1 week ago', content: 'Terraform 2.0 is now generally available! New features include native drift detection, enhanced state management, and improved provider support.', hasImage: false },
    ],
    photos: [{ label: 'HashiConf', color: 'linear-gradient(135deg, #333, #000)' }],
  },
  'atlassian': {
    id: 10,
    name: 'Atlassian',
    slug: 'atlassian',
    verified: true,
    logoText: 'A',
    logoColor: '#0052CC',
    tagline: 'Atlassian builds software for teams — from Jira and Confluence to Trello and Bitbucket.',
    website: 'atlassian.com',
    industry: 'SaaS, Collaboration, Developer Tools',
    size: '10k+ employees',
    founded: '2002',
    status: 'Public',
    followers: 5100,
    locations: ['Sydney', 'San Francisco', 'Bengaluru'],
    techStack: ['java', 'react', 'typescript', 'kotlin', 'python', 'aws', 'graphql', 'postgresql'],
    about: `Over 300,000 companies worldwide rely on Atlassian's products, including NASA, Tesla, and Netflix, to organize, discuss, and complete shared work.`,
    updates: [
      { id: 1, time: '2 days ago', content: 'Jira AI is now in open beta! Automate issue triage, generate smart summaries, and get intelligent suggestions powered by machine learning. 🤖', hasImage: true, imageLabel: 'Jira AI Beta' },
      { id: 2, time: '5 days ago', content: 'Join us at Team\'26 in Las Vegas! Our annual conference for teams building the future of work. Early bird registration now open.', hasImage: false },
    ],
    photos: [{ label: 'Atlassian Team', color: 'linear-gradient(135deg, #0052CC, #0747A6)' }],
  },
  'kvk': {
    id: 4,
    name: 'KVK',
    slug: 'kvk',
    verified: false,
    logoText: 'KVK',
    logoColor: '#1B4D9F',
    tagline: 'Digital infrastructure supporting 600+ enthusiastic IT professionals for Dutch entrepreneurs.',
    website: 'kvk.nl',
    industry: 'Government',
    size: '1k-5k employees',
    founded: '1922',
    status: 'Government',
    followers: 95,
    locations: ['Utrecht'],
    techStack: ['java', 'spring-boot', 'azure', 'angular', 'postgresql', 'kafka'],
    about: `KVK (Kamer van Koophandel) is the Dutch Chamber of Commerce. With 600 IT professionals, they build the digital infrastructure that enables Dutch entrepreneurs to do business safely and responsibly.`,
    updates: [
      { id: 1, time: '1 week ago', content: 'We\'ve modernized our business registration API with improved performance and new endpoints for developers. Check out the documentation.', hasImage: false },
    ],
    photos: [{ label: 'KVK Office', color: 'linear-gradient(135deg, #1B4D9F, #2D6FD1)' }],
  },
};

const TABS = ['Updates', 'About', 'Tech Stack', 'Videos', 'People'];

export default function CompanyDetail() {
  const { currentUser } = useAuth();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('Updates');
  const [following, setFollowing] = useState(false);

  if (!currentUser) return <Navigate to="/login" />;

  const company = COMPANIES_DATA[slug];

  if (!company) {
    return (
      <div className="company-detail">
        <Link to="/companies" className="company-detail__back">← Back to companies</Link>
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Company not found.
        </div>
      </div>
    );
  }

  return (
    <div className="company-detail">
      {/* Back link */}
      <Link to="/companies" className="company-detail__back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to companies
      </Link>

      {/* Hero */}
      <div className="company-detail__hero">
        <div className="company-detail__logo" style={{ background: company.logoColor }}>
          {company.logoText}
        </div>
        <div className="company-detail__hero-info">
          <h1 className="company-detail__name">{company.name}</h1>
          <p className="company-detail__tagline">{company.tagline}</p>
          <div className="company-detail__actions">
            <button
              className={`company-detail__follow-btn ${following ? 'company-detail__follow-btn--following' : ''}`}
              onClick={() => setFollowing(!following)}
            >
              {following ? '✓ Following' : 'Follow'}
            </button>
            <button className="company-detail__more-btn">⋯</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="company-detail__tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`company-detail__tab ${activeTab === tab ? 'company-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="company-detail__content">
        {/* Left — Main Content */}
        <div className="company-detail__feed">
          {activeTab === 'Updates' && (
            <>
              <h2 className="company-detail__feed-title">Updates</h2>
              {company.updates.map(update => (
                <div key={update.id} className="company-detail__update">
                  <div className="company-detail__update-header">
                    <div className="company-detail__update-logo" style={{ background: company.logoColor }}>
                      {company.logoText}
                    </div>
                    <div className="company-detail__update-meta">
                      <span className="company-detail__update-author">
                        {company.name}
                        {company.verified && <span className="company-detail__update-author-verified">●</span>}
                      </span>
                      <span className="company-detail__update-time">{update.time}</span>
                    </div>
                  </div>
                  <div className="company-detail__update-body">
                    {update.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>{line}<br /></React.Fragment>
                    ))}
                  </div>
                  {update.hasImage && (
                    <div className="company-detail__update-image" style={{ background: company.logoColor, color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                      {update.imageLabel}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeTab === 'About' && (
            <div className="company-detail__about">
              <h3>About {company.name}</h3>
              {company.about.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <h3>Locations</h3>
              <ul>
                {company.locations.map(loc => <li key={loc}>{loc}</li>)}
              </ul>
            </div>
          )}

          {activeTab === 'Tech Stack' && (
            <div>
              <h2 className="company-detail__feed-title">Tech Stack</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Technologies used at {company.name}
              </p>
              <div className="company-detail__tech-grid">
                {company.techStack.map(tag => (
                  <span key={tag} className="company-detail__tech-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Videos' && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No videos available yet.
            </div>
          )}

          {activeTab === 'People' && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
              People directory coming soon.
            </div>
          )}
        </div>

        {/* Right — Sidebar */}
        <div className="company-detail__sidebar">
          {/* At a Glance */}
          <div className="company-detail__sidebar-section">
            <h3 className="company-detail__sidebar-section-title">At a glance</h3>

            <div className="company-detail__sidebar-row">
              <span className="company-detail__sidebar-label">WEBSITE</span>
              <span className="company-detail__sidebar-value">
                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
                  {company.name}
                </a>
              </span>
            </div>

            <div className="company-detail__sidebar-row">
              <span className="company-detail__sidebar-label">INDUSTRY</span>
              <span className="company-detail__sidebar-value">{company.industry}</span>
            </div>

            <div className="company-detail__info-grid">
              <div className="company-detail__sidebar-row">
                <span className="company-detail__sidebar-label">SIZE</span>
                <span className="company-detail__sidebar-value">{company.size}</span>
              </div>
              <div className="company-detail__sidebar-row">
                <span className="company-detail__sidebar-label">FOUNDED</span>
                <span className="company-detail__sidebar-value">{company.founded}</span>
              </div>
              <div className="company-detail__sidebar-row">
                <span className="company-detail__sidebar-label">STATUS</span>
                <span className="company-detail__sidebar-value">{company.status}</span>
              </div>
            </div>

            <div className="company-detail__info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="company-detail__sidebar-row">
                <span className="company-detail__sidebar-label">FOLLOWERS</span>
                <span className="company-detail__sidebar-value">{company.followers.toLocaleString()}</span>
              </div>
              <div className="company-detail__sidebar-row">
                <span className="company-detail__sidebar-label">SOCIAL</span>
                <div className="company-detail__social">
                  <span className="company-detail__social-icon" title="Twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                  </span>
                  <span className="company-detail__social-icon" title="GitHub">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  </span>
                  <span className="company-detail__social-icon" title="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="company-detail__sidebar-section">
            <h3 className="company-detail__sidebar-section-title">Photos</h3>
            <div className="company-detail__photos">
              {company.photos.map((photo, i) => (
                <div
                  key={i}
                  className="company-detail__photo"
                  style={{ background: photo.color }}
                >
                  {photo.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
