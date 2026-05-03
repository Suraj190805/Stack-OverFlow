import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Tags.css';

const TAGS_DATA = [
  {
    name: 'javascript',
    description: 'For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript). Note that JavaScript is NOT the same as Java.',
    totalQuestions: 2531858,
    askedToday: 9,
    askedThisWeek: 67,
  },
  {
    name: 'python',
    description: 'Python is a dynamically typed, multi-purpose programming language designed to be quick to learn, understand, and use, with a clean and expressive syntax.',
    totalQuestions: 2220531,
    askedToday: 9,
    askedThisWeek: 124,
  },
  {
    name: 'java',
    description: 'Java is a high-level, object-oriented programming language. Use this tag when you\'re having problems using or understanding the language itself.',
    totalQuestions: 1921810,
    askedThisWeek: 46,
    askedThisMonth: 189,
  },
  {
    name: 'c#',
    description: 'C# (pronounced "see sharp") is a high-level, statically typed, multi-paradigm programming language developed by Microsoft. C# code usually targets Microsoft\'s .NET ecosystem.',
    totalQuestions: 1626670,
    askedThisWeek: 46,
    askedThisMonth: 177,
  },
  {
    name: 'php',
    description: 'PHP is an open-source, multi-paradigm, dynamically-typed, and interpreted scripting language designed initially for server-side web development.',
    totalQuestions: 1465685,
    askedToday: 5,
    askedThisWeek: 19,
  },
  {
    name: 'android',
    description: 'Android is Google\'s mobile operating system, used for programming or developing digital devices (Smartphones, Tablets, Automobiles, TVs, etc.).',
    totalQuestions: 1418664,
    askedToday: 5,
    askedThisWeek: 32,
  },
  {
    name: 'html',
    description: 'HTML (HyperText Markup Language) is the markup language for creating web pages and other information to be displayed in a web browser.',
    totalQuestions: 1189934,
    askedToday: 5,
    askedThisWeek: 33,
  },
  {
    name: 'jquery',
    description: 'jQuery is a JavaScript library. jQuery is a popular cross-browser JavaScript library that facilitates Document Object Model (DOM) traversal, event handling, animation, and AJAX interactions.',
    totalQuestions: 1031122,
    askedThisMonth: 15,
    askedThisYear: 284,
  },
  {
    name: 'c++',
    description: 'C++ is a general-purpose programming language. Use this tag for questions about/utilizing C++. Do not also tag with [c] unless you have a specific reason.',
    totalQuestions: 810231,
    askedToday: 5,
    askedThisWeek: 48,
  },
  {
    name: 'css',
    description: 'CSS (Cascading Style Sheets) is a representation style sheet language used for describing the look and formatting of HTML (HyperText Markup Language) documents.',
    totalQuestions: 803122,
    askedToday: 3,
    askedThisWeek: 26,
  },
  {
    name: 'ios',
    description: 'iOS is the mobile operating system running on the Apple iPhone, iPod touch, and iPad. Use this tag [ios] for questions related to programming on the iOS platform.',
    totalQuestions: 680725,
    askedThisWeek: 10,
    askedThisMonth: 58,
  },
  {
    name: 'sql',
    description: 'Structured Query Language (SQL) is a language for querying databases. Questions should include code examples, table structure, sample data, and a tag for the DBMS implementation.',
    totalQuestions: 675503,
    askedToday: 4,
    askedThisWeek: 38,
  },
  {
    name: 'mysql',
    description: 'MySQL is a free, open-source Relational Database Management System (RDBMS) that uses Structured Query Language (SQL). It is the most popular database system used with PHP.',
    totalQuestions: 662345,
    askedToday: 3,
    askedThisWeek: 22,
  },
  {
    name: 'r',
    description: 'R is a free, open-source programming language & software environment for statistical computing, bioinformatics, visualization & general computing.',
    totalQuestions: 504123,
    askedToday: 4,
    askedThisWeek: 30,
  },
  {
    name: 'reactjs',
    description: 'React is a JavaScript library for building user interfaces. It uses a declarative, component-based paradigm and aims to be efficient and flexible.',
    totalQuestions: 478932,
    askedToday: 7,
    askedThisWeek: 52,
  },
  {
    name: 'node.js',
    description: 'Node.js is an event-based, non-blocking, asynchronous I/O runtime that uses Google\'s V8 JavaScript engine and libuv library.',
    totalQuestions: 465210,
    askedToday: 4,
    askedThisWeek: 28,
  },
  {
    name: 'arrays',
    description: 'An array is an ordered linear data structure consisting of a collection of elements, each identified by one or more indexes.',
    totalQuestions: 412340,
    askedToday: 6,
    askedThisWeek: 35,
  },
  {
    name: 'typescript',
    description: 'TypeScript is a typed superset of JavaScript that transpiles to plain JavaScript. It adds optional static typing and class-based object-oriented programming to the language.',
    totalQuestions: 289450,
    askedToday: 5,
    askedThisWeek: 44,
  },
  {
    name: 'angular',
    description: 'Questions about Angular, the web framework from Google. Use this tag for Angular questions which are not specific to an individual version.',
    totalQuestions: 312456,
    askedToday: 2,
    askedThisWeek: 18,
  },
  {
    name: 'django',
    description: 'Django is an open-source server-side web application framework written in Python. It follows the model–template–views architectural pattern.',
    totalQuestions: 315890,
    askedToday: 3,
    askedThisWeek: 20,
  },
  {
    name: 'json',
    description: 'JSON (JavaScript Object Notation) is a serializable data interchange format that is a machine-readable alternative to XML.',
    totalQuestions: 381234,
    askedToday: 3,
    askedThisWeek: 19,
  },
  {
    name: 'swift',
    description: 'Swift is a general-purpose programming language developed by Apple Inc. for iOS, macOS, watchOS, tvOS, and Linux.',
    totalQuestions: 340567,
    askedToday: 2,
    askedThisWeek: 14,
  },
  {
    name: 'ruby-on-rails',
    description: 'Ruby on Rails is an open-source web application framework written in Ruby. It follows the Model-View-Controller (MVC) pattern.',
    totalQuestions: 345210,
    askedThisWeek: 3,
    askedThisMonth: 12,
  },
  {
    name: 'excel',
    description: 'Only for questions on programming against Excel objects or files. Use for formulas, VBA, and other programming tasks related to Excel.',
    totalQuestions: 289012,
    askedToday: 3,
    askedThisWeek: 21,
  },
  {
    name: 'pandas',
    description: 'Pandas is a Python library for data manipulation and analysis. It provides data structures and operations for manipulating numerical tables and time series.',
    totalQuestions: 276543,
    askedToday: 4,
    askedThisWeek: 30,
  },
  {
    name: 'linux',
    description: 'Linux is a family of free and open-source software operating systems based on the Linux kernel. Questions about using and administering Linux.',
    totalQuestions: 245678,
    askedToday: 2,
    askedThisWeek: 16,
  },
  {
    name: 'git',
    description: 'Git is an open-source distributed version control system (DVCS). Use this tag for questions about Git usage and workflows.',
    totalQuestions: 234567,
    askedToday: 3,
    askedThisWeek: 18,
  },
  {
    name: 'docker',
    description: 'Docker is an open-source project to easily create lightweight, portable, self-sufficient containers from any application.',
    totalQuestions: 189234,
    askedToday: 3,
    askedThisWeek: 22,
  },
  {
    name: 'mongodb',
    description: 'MongoDB is a scalable, high-performance, open-source, document-oriented NoSQL database. It supports a large number of languages and application development platforms.',
    totalQuestions: 156789,
    askedToday: 2,
    askedThisWeek: 14,
  },
  {
    name: 'postgresql',
    description: 'PostgreSQL is an open-source, object-relational database management system (ORDBMS) available for all major platforms.',
    totalQuestions: 145678,
    askedToday: 2,
    askedThisWeek: 16,
  },
  {
    name: 'vue.js',
    description: 'Vue.js is an open-source, progressive JavaScript framework for building user interfaces that aims to be incrementally adoptable.',
    totalQuestions: 112345,
    askedToday: 2,
    askedThisWeek: 12,
  },
  {
    name: 'firebase',
    description: 'Firebase is a Backend-as-a-Service (BaaS) and application development platform provided by Google. It provides hosted backend services such as realtime database and authentication.',
    totalQuestions: 134567,
    askedToday: 2,
    askedThisWeek: 15,
  },
  {
    name: 'flutter',
    description: 'Flutter is an open-source UI software development kit created by Google. It is used to develop cross-platform applications for mobile, web, and desktop.',
    totalQuestions: 123456,
    askedToday: 3,
    askedThisWeek: 24,
  },
  {
    name: 'next.js',
    description: 'Next.js is a React framework that enables server-side rendering, static site generation, and other powerful features for building modern web applications.',
    totalQuestions: 98765,
    askedToday: 4,
    askedThisWeek: 28,
  },
  {
    name: 'spring-boot',
    description: 'Spring Boot is a framework that helps to create stand-alone, production-grade Spring-based applications with minimal configuration.',
    totalQuestions: 112890,
    askedToday: 2,
    askedThisWeek: 16,
  },
  {
    name: 'kotlin',
    description: 'Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to interoperate fully with Java.',
    totalQuestions: 89012,
    askedToday: 1,
    askedThisWeek: 10,
  },
];

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (n >= 1000) return Math.floor(n).toLocaleString();
  return n.toString();
}

export default function Tags() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredTags = useMemo(() => {
    let result = [...TAGS_DATA];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(q) ||
        tag.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.totalQuestions - a.totalQuestions);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'new':
        result.sort((a, b) => (b.askedToday || 0) - (a.askedToday || 0));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy]);

  const handleTagClick = (tagName) => {
    navigate(`/dashboard?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="tags-page" id="tags-page">
      {/* Header */}
      <h1 className="tags-page__title">{t('tags.title')}</h1>
      <p className="tags-page__description">{t('tags.description')}</p>
      <a href="#" className="tags-page__synonyms-link">{t('tags.synonymsLink')}</a>

      {/* Controls */}
      <div className="tags-page__controls">
        <div className="tags-page__search">
          <svg className="tags-page__search-icon" width="16" height="16" viewBox="0 0 16 16">
            <path d="M11.5 7a4.5 4.5 0 1 0-2.03 3.77l3.63 3.63a.5.5 0 0 0 .7-.7l-3.63-3.63A4.5 4.5 0 0 0 11.5 7ZM7 10.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="tags-page__search-input"
            placeholder={t('tags.filterPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="tags-search-input"
          />
        </div>
        <div className="tags-page__sort">
          {[
            { key: 'popular', label: t('tags.popular') },
            { key: 'name', label: t('tags.name') },
            { key: 'new', label: t('tags.new') },
          ].map(s => (
            <button
              key={s.key}
              className={`tags-page__sort-btn ${sortBy === s.key ? 'tags-page__sort-btn--active' : ''}`}
              onClick={() => setSortBy(s.key)}
              id={`tags-sort-${s.key}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Grid */}
      <div className="tags-grid">
        {filteredTags.length === 0 ? (
          <div className="tags-page__empty">
            <p>{t('tags.noResults', { query: searchQuery })}</p>
          </div>
        ) : (
          filteredTags.map(tag => (
            <div className="tag-card" key={tag.name} id={`tag-card-${tag.name}`}>
              <div className="tag-card__header">
                <span
                  className="s-tag tag-card__name"
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </span>
              </div>
              <p className="tag-card__description">{tag.description}</p>
              <div className="tag-card__stats">
                <span className="tag-card__total">{formatNumber(tag.totalQuestions)} {t('tags.questions')}</span>
                <span className="tag-card__activity">
                  {tag.askedToday != null && (
                    <>{tag.askedToday} {t('tags.askedToday')}, </>
                  )}
                  {tag.askedThisWeek != null && (
                    <>{tag.askedThisWeek} {t('tags.thisWeek')}</>
                  )}
                  {tag.askedThisMonth != null && !tag.askedToday && (
                    <>, {tag.askedThisMonth} {t('tags.thisMonth')}</>
                  )}
                  {tag.askedThisMonth != null && tag.askedToday != null && ''}
                  {tag.askedThisYear != null && (
                    <>, {tag.askedThisYear} {t('tags.thisYear')}</>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
