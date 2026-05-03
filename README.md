
<h1 align="center">Stack Overflow Clone</h1>

<p align="center">
  A full-stack, feature-rich replica of Stack Overflow built with React, Node.js, Express, and MongoDB Atlas — featuring AI-powered assistance, multi-language support, subscription payments, social networking, and a comprehensive reward system.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

---
LIVE LINK : https://stack-over-flow-psi.vercel.app
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Pages & Modules](#-pages--modules)
- [Security & Restrictions](#-security--restrictions)
- [Multi-Language Support](#-multi-language-support)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

This project is a comprehensive, production-grade clone of [Stack Overflow](https://stackoverflow.com) — the world's largest developer Q&A platform. It goes beyond a basic clone by integrating **AI-powered assistance** (Google Gemini), a **subscription payment system**, **social networking features**, a **points-based reward economy**, and **full internationalization** across 6 languages.

Built as a full-stack application with a React frontend and Node.js/Express backend connected to MongoDB Atlas, the platform demonstrates modern web development practices including JWT authentication, OTP verification, time-restricted operations, and responsive design with dark/light theme support.

---

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Authentication** with JWT tokens
- **OTP Verification** via email (EmailJS) for login & password reset
- **Browser-based Auth Detection** (Chrome requires OTP, others direct login)
- **Time-Restricted Login** — only between **10:00 AM – 1:00 PM IST**
- **Mobile Login Restriction** — same window with device detection
- **Forgot Password** — OTP-verified password reset, limited to **once per day**
- **Login History Tracking** — browser, OS, device type, IP, and timestamps

### 💬 Q&A Platform
- **Ask Questions** with title, body, and tag support
- **Answer Questions** with full markdown support
- **Upvote/Downvote** with toggle logic (one vote per user per item)
- **Save/Bookmark** questions for later access
- **Tag-based Filtering** and sorting (newest, active, votes, unanswered)
- **Pagination** with configurable items per page

### 🤖 AI Assist (Google Gemini)
- **AI-powered Q&A** using Google Gemini 2.5 Flash
- **Chat History** persisted in localStorage
- **Markdown Rendering** with code block syntax highlighting
- **Suggestion Prompts** for quick interaction
- **Typing Indicators** and smooth animations

### 💳 Subscription & Payments
- **4-Tier Plans** — Free, Bronze (₹99), Silver (₹299), Gold (₹499)
- **Stripe-style Checkout** with card/UPI/net banking simulation
- **Time-Restricted Payments** — only between **10:00 AM – 11:00 AM IST**
- **Invoice Generation** with auto-email delivery via EmailJS
- **Transaction History** with detailed records
- **Plan-based Question Limits** (1/2/5/Unlimited per day)

### 🏆 Reward System
- **+5 Points** for posting an answer
- **+2 Points** for asking a question
- **+5 Bonus** when an answer reaches 5 upvotes
- **-2 Points** deduction for receiving a downvote
- **-5 Points** deduction for answer removal
- **Point Transfers** between users (requires >10 points)
- **Animated Balance Counter** with confetti effects
- **Full Transaction History**

### 🌐 Social Features
- **Social Feed** with text and media posts
- **Like, Comment, Share** functionality
- **Friend System** — discover, add, remove friends
- **Daily Post Limits** based on subscription plan
- **User Discovery** with search

### 🗂️ Community Features
- **Tags** — browse, search, and filter by technology tags
- **Users** — directory with grid layout, search, and sorting
- **Companies** — company profiles with job listings and tech stacks
- **Collectives** — technology-focused communities (AWS, Google Cloud, etc.)
- **Challenges** — coding challenges with entries, voting, and guidelines
- **Saves** — bookmark manager with custom lists

### 🌍 Multi-Language Support (i18n)
- **6 Languages** — English, Hindi, Spanish, French, Portuguese, Chinese
- **500+ Translation Keys** per language
- **OTP-verified Language Switching** in settings
- **Dynamic UI Updates** — all components respond to language changes
- **Fallback to English** for missing keys

### 🎨 UI/UX
- **Dark/Light Theme** toggle with smooth transitions
- **Responsive Design** — desktop, tablet, and mobile
- **Glass Morphism** and modern design patterns
- **Micro-animations** and hover effects
- **Toast Notifications** with auto-dismiss
- **Stack Overflow Stacks Design System** inspired styling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with hooks & functional components |
| **React Router DOM 7** | Client-side routing & navigation |
| **Vite 8** | Build tool & dev server (HMR) |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Generative AI** | Gemini 2.5 Flash for AI Assist |
| **EmailJS** | Client-side email delivery (OTP, invoices) |
| **Stripe.js** | Payment processing UI components |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB Atlas** | Cloud database (Mongoose ODM) |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcrypt.js** | Password hashing |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting with React hooks rules |
| **Nodemon** | Auto-restart server on changes |
| **Git & GitHub** | Version control & hosting |

---

## 📁 Project Structure

```
Stack-OverFlow/
├── public/                     # Static assets (favicon, icons)
├── server/                     # Backend API
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   ├── Post.js
│   │   ├── Vote.js
│   │   ├── Save.js
│   │   ├── Transaction.js
│   │   └── LoginRecord.js
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Login, register, forgot password
│   │   ├── users.js            # User CRUD, friends, search
│   │   ├── questions.js        # Q&A with voting
│   │   ├── answers.js          # Answers with points system
│   │   ├── posts.js            # Social feed posts
│   │   └── points.js           # Point transfers & transactions
│   ├── seed.js                 # Database seeder script
│   └── index.js                # Express app entry point
├── src/                        # Frontend source
│   ├── components/
│   │   ├── Layout/             # Navbar, Sidebar, Footer
│   │   └── common/             # Reusable components (Modal, Toast, OTP, etc.)
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state & operations
│   │   ├── LanguageContext.jsx # i18n with 6 languages
│   │   ├── PointsContext.jsx   # Reward system state
│   │   ├── ThemeContext.jsx    # Dark/Light theme
│   │   └── ToastContext.jsx    # Notification system
│   ├── data/
│   │   ├── translations/       # Language JSON files (en, hi, es, fr, pt, zh)
│   │   └── mockUsers.js        # Subscription plans & static data
│   ├── hooks/
│   │   └── useLocalStorage.js  # Persistent state hook
│   ├── pages/                  # 19 page components
│   │   ├── Home.jsx            # Landing page with AI banner
│   │   ├── Dashboard.jsx       # Q&A feed with filters
│   │   ├── AIAssist.jsx        # Gemini-powered chat
│   │   ├── Login.jsx           # Authentication
│   │   ├── Register.jsx        # User registration
│   │   ├── ForgotPassword.jsx  # OTP-based password reset
│   │   ├── Profile.jsx         # User profile & activity
│   │   ├── Settings.jsx        # Language & preferences
│   │   ├── Subscription.jsx    # Payment plans
│   │   ├── Rewards.jsx         # Points & transfers
│   │   ├── SocialFeed.jsx      # Social networking
│   │   ├── Challenges.jsx      # Coding challenges
│   │   ├── Collectives.jsx     # Technology communities
│   │   ├── Companies.jsx       # Company directory
│   │   ├── Tags.jsx            # Tag explorer
│   │   ├── Users.jsx           # User directory
│   │   ├── Saves.jsx           # Bookmarks manager
│   │   └── AskQuestion.jsx     # Question composer
│   ├── services/
│   │   └── api.js              # Axios-like API client with JWT
│   ├── utils/                  # Utility functions
│   │   ├── timeRestrictions.js # IST time window checks
│   │   ├── rateLimit.js        # Daily usage limits
│   │   ├── deviceDetection.js  # Browser/OS/device detection
│   │   ├── emailService.js     # EmailJS integration
│   │   └── passwordGenerator.js# Secure password generation
│   ├── App.jsx                 # Root component with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global design system
├── .env                        # Environment variables (not in repo)
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- **MongoDB Atlas** account (free tier works)
- **Google Gemini API key** ([Get one free](https://aistudio.google.com/apikey))
- **EmailJS** account ([Sign up free](https://www.emailjs.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Suraj190805/Stack-OverFlow.git
cd Stack-OverFlow

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Set up environment variables (see section below)
cp .env.example .env   # Then edit with your keys

# 5. Seed the database with sample data
cd server
node seed.js
cd ..

# 6. Start the backend server (Terminal 1)
cd server
npm run dev

# 7. Start the frontend dev server (Terminal 2)
npm run dev
```

The app will be running at `http://localhost:5173` with the API at `http://localhost:5000`.

### Demo Accounts

| Account | Email | Password | Plan | Points |
|---------|-------|----------|------|--------|
| John Developer | john@example.com | password | Free | 25 |
| Jane Coder | jane@example.com | password | Silver | 150 |
| Alex Programmer | alex@example.com | password | Gold | 500 |
| Sara Tech | sara@example.com | password | Bronze | 8 |
| Mike Stack | mike@example.com | password | Free | 42 |

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# EmailJS (for OTP & invoice emails)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_OTP_TEMPLATE_ID=your_otp_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# MongoDB Atlas
VITE_MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stackoverflow

# JWT Secret
VITE_JWT_SECRET=your_jwt_secret

# Stripe (optional — simulated checkout)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stackoverflow
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user (JWT required) |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| PUT | `/api/auth/reset-password` | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user profile |
| GET | `/api/users/search?q=` | Search users |
| POST | `/api/users/friends/:id` | Add friend |
| DELETE | `/api/users/friends/:id` | Remove friend |
| GET | `/api/users/:id/login-history` | Get login history |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/:id` | Get question with answers |
| POST | `/api/questions` | Create question (+2 points) |
| POST | `/api/questions/:id/vote` | Upvote/downvote question |

### Answers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/answers/:questionId` | Get answers for question |
| POST | `/api/answers` | Post answer (+5 points) |
| DELETE | `/api/answers/:id` | Delete answer (-5 points) |
| POST | `/api/answers/:id/vote` | Upvote/downvote answer |

### Points & Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points/transactions` | Get transaction history |
| POST | `/api/points/transfer` | Transfer points to user |

### Social Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |

---

## 📄 Pages & Modules

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Home** | `/home` | Landing page with AI search banner & personalized stats |
| 2 | **Dashboard** | `/dashboard` | Q&A feed with filters, sorting, pagination |
| 3 | **AI Assist** | `/ai-assist` | Gemini-powered chat interface |
| 4 | **Ask Question** | `/ask` | Question composer with tags |
| 5 | **Login** | `/login` | Email/password with OTP verification |
| 6 | **Register** | `/register` | New account creation |
| 7 | **Forgot Password** | `/forgot-password` | OTP-verified password reset |
| 8 | **Profile** | `/profile` | User profile, activity, friends |
| 9 | **Settings** | `/settings` | Language switcher with OTP |
| 10 | **Subscription** | `/subscription` | Payment plans with Stripe checkout |
| 11 | **Rewards** | `/rewards` | Points balance, transfers, history |
| 12 | **Social Feed** | `/social` | Social networking posts |
| 13 | **Challenges** | `/challenges` | Coding challenges with voting |
| 14 | **Collectives** | `/collectives` | Technology communities |
| 15 | **Companies** | `/companies` | Company directory & profiles |
| 16 | **Tags** | `/tags` | Tag explorer with search |
| 17 | **Users** | `/users` | User directory with grid |
| 18 | **Saves** | `/saves` | Bookmarked questions |

---

## 🔒 Security & Restrictions

| Feature | Rule | Implementation |
|---------|------|----------------|
| **Login Window** | 10:00 AM – 1:00 PM IST only | `timeRestrictions.js` → `AuthContext.jsx` |
| **Payment Window** | 10:00 AM – 11:00 AM IST only | `timeRestrictions.js` → `Subscription.jsx` |
| **Forgot Password** | Once per calendar day per user | `rateLimit.js` → `ForgotPassword.jsx` |
| **Point Transfers** | Requires >10 points | `server/routes/points.js` |
| **Mobile Login** | 10:00 AM – 1:00 PM IST only | `deviceDetection.js` → `AuthContext.jsx` |
| **JWT Auth** | Token-based stateless auth | `server/middleware/auth.js` |
| **Password Hashing** | bcrypt with salt rounds | `server/routes/auth.js` |
| **Question Limits** | Plan-based daily limits | `rateLimit.js` → `AskQuestion.jsx` |

---

## 🌍 Multi-Language Support

The platform supports **6 languages** with 500+ translation keys each:

| Language | Code | File |
|----------|------|------|
| 🇺🇸 English | `en` | `src/data/translations/en.json` |
| 🇮🇳 Hindi | `hi` | `src/data/translations/hi.json` |
| 🇪🇸 Spanish | `es` | `src/data/translations/es.json` |
| 🇫🇷 French | `fr` | `src/data/translations/fr.json` |
| 🇧🇷 Portuguese | `pt` | `src/data/translations/pt.json` |
| 🇨🇳 Chinese | `zh` | `src/data/translations/zh.json` |

Translation covers all modules: Navigation, Authentication, Dashboard, AI Assist, Challenges, Collectives, Companies, Saves, Profile, Rewards, Settings, and common UI elements.

---

## 📸 Screenshots

> To add screenshots, place them in a `/screenshots` directory and reference here.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is for **educational purposes** — inspired by [Stack Overflow](https://stackoverflow.com). All trademarks belong to their respective owners.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Suraj190805">Suraj</a>
</p>
