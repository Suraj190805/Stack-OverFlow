import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';
import Question from './models/Question.js';
import Post from './models/Post.js';

dotenv.config();

// ── Mock Data (ported from src/data/mockUsers.js) ───────

const MOCK_USERS = [
  { oldId: 'user_1', username: 'john_dev', displayName: 'John Developer', email: 'john@example.com', phone: '+919876543210', password: 'password', plan: 'free', points: 25, language: 'en', joinDate: '2025-06-15' },
  { oldId: 'user_2', username: 'jane_coder', displayName: 'Jane Coder', email: 'jane@example.com', phone: '+919876543211', password: 'password', plan: 'silver', points: 150, language: 'en', joinDate: '2025-03-22' },
  { oldId: 'user_3', username: 'dev_alex', displayName: 'Alex Programmer', email: 'alex@example.com', phone: '+919876543212', password: 'password', plan: 'gold', points: 500, language: 'en', joinDate: '2024-11-10' },
  { oldId: 'user_4', username: 'sara_tech', displayName: 'Sara Tech', email: 'sara@example.com', phone: '+919876543213', password: 'password', plan: 'bronze', points: 8, language: 'es', joinDate: '2025-09-01' },
  { oldId: 'user_5', username: 'mike_stack', displayName: 'Mike Stack', email: 'mike@example.com', phone: '+919876543214', password: 'password', plan: 'free', points: 42, language: 'en', joinDate: '2025-07-18' },
];

// Generate users 6-13
for (let i = 6; i <= 13; i++) {
  MOCK_USERS.push({
    oldId: `user_${i}`,
    username: `user${i}`,
    displayName: `User ${i}`,
    email: `user${i}@example.com`,
    phone: `+91987654${3200 + i}`,
    password: 'password',
    plan: 'free',
    points: Math.floor(Math.random() * 50) + 5,
    language: 'en',
    joinDate: '2025-01-01',
  });
}

// Friend mapping (oldId -> [oldId])
const FRIEND_MAP = {
  user_1: ['user_2', 'user_3', 'user_4'],
  user_2: ['user_1', 'user_3', 'user_5', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10', 'user_11', 'user_12', 'user_13'],
  user_3: ['user_1', 'user_2'],
  user_4: ['user_1'],
  user_5: ['user_2'],
};
for (let i = 6; i <= 13; i++) {
  FRIEND_MAP[`user_${i}`] = ['user_2'];
}

// Questions — same as mockUsers.js but referenced by oldId
const MOCK_QUESTIONS = [
  { oldUserId: 'user_1', title: 'How to center a div in CSS?', body: 'I have been trying to center a div inside a parent container using margin auto, but it only centers horizontally. I need both horizontal and vertical centering. The parent div has a fixed height of 500px. I have tried text-align: center but that only works for inline elements. What is the modern best practice for centering elements in CSS?', tags: ['css', 'html', 'flexbox'], upvotes: 12, downvotes: 1, answers: 3, views: 48210, createdAt: '2026-04-01T10:30:00Z', category: 'Advice' },
  { oldUserId: 'user_2', title: 'React useEffect cleanup function — when is it actually needed?', body: 'I understand that useEffect can return a cleanup function, but I am confused about when I actually need to return one. If I am just fetching data, do I need a cleanup? What about event listeners? Can someone explain the scenarios where cleanup is required vs optional?', tags: ['reactjs', 'hooks', 'javascript'], upvotes: 8, downvotes: 0, answers: 2, views: 12840, createdAt: '2026-04-02T14:15:00Z' },
  { oldUserId: 'user_3', title: 'Node.js async/await best practices for error handling', body: 'What are the recommended patterns for handling errors with async/await in Node.js?', tags: ['node.js', 'async-await', 'javascript', 'error-handling'], upvotes: 25, downvotes: 2, answers: 5, views: 87530, createdAt: '2026-04-03T09:00:00Z', category: 'Best practices', bounty: 100 },
  { oldUserId: 'user_4', title: 'What is the difference between == and === in JavaScript?', body: 'I keep seeing both == and === used in JavaScript code.', tags: ['javascript', 'comparison', 'operators'], upvotes: 1842, downvotes: 12, answers: 28, views: 2850400, createdAt: '2025-08-15T08:20:00Z' },
  { oldUserId: 'user_5', title: 'How do I remove a specific item from an array in JavaScript?', body: 'I have an array of numbers and I want to remove a specific value from it.', tags: ['javascript', 'arrays'], upvotes: 3210, downvotes: 8, answers: 42, views: 4120000, createdAt: '2025-06-10T12:45:00Z' },
  { oldUserId: 'user_1', title: 'What does "use strict" do in JavaScript?', body: 'I see "use strict" at the top of many JavaScript files.', tags: ['javascript', 'strict-mode', 'ecmascript'], upvotes: 2650, downvotes: 15, answers: 18, views: 1920000, createdAt: '2025-05-20T09:30:00Z' },
  { oldUserId: 'user_2', title: 'How do JavaScript closures work?', body: 'I am trying to understand closures in JavaScript.', tags: ['javascript', 'closures', 'scope'], upvotes: 4580, downvotes: 22, answers: 35, views: 3450000, createdAt: '2025-04-12T16:00:00Z', category: 'Discussion' },
  { oldUserId: 'user_3', title: 'var vs let vs const — what are the differences?', body: 'With ES6 we got let and const in addition to var.', tags: ['javascript', 'ecmascript-6', 'scope', 'variables'], upvotes: 2100, downvotes: 5, answers: 22, views: 2100000, createdAt: '2025-07-08T11:20:00Z' },
  { oldUserId: 'user_4', title: 'How to check if a string contains a substring in JavaScript?', body: 'What is the best way to check whether a string contains a specific substring?', tags: ['javascript', 'string'], upvotes: 1520, downvotes: 3, answers: 12, views: 1850000, createdAt: '2025-09-02T14:50:00Z' },
  { oldUserId: 'user_5', title: 'What is event delegation in JavaScript and why is it useful?', body: 'I keep hearing about event delegation as a performance optimization technique.', tags: ['javascript', 'events', 'dom', 'performance'], upvotes: 890, downvotes: 4, answers: 8, views: 345000, createdAt: '2026-01-15T10:00:00Z' },
  { oldUserId: 'user_1', title: 'React — useState vs useReducer, which should I use?', body: 'I am building a form with multiple fields and validation.', tags: ['reactjs', 'hooks', 'state-management'], upvotes: 420, downvotes: 3, answers: 7, views: 156000, createdAt: '2026-02-10T09:15:00Z', category: 'Advice', bounty: 50 },
  { oldUserId: 'user_2', title: 'How to prevent unnecessary re-renders in React?', body: 'My React app is rendering components way too many times.', tags: ['reactjs', 'performance', 'react-hooks', 'rendering'], upvotes: 680, downvotes: 2, answers: 11, views: 234000, createdAt: '2026-01-28T15:30:00Z', category: 'Debugging' },
  { oldUserId: 'user_3', title: 'React Context vs Redux — when should I use which?', body: 'I have been using React Context for state management.', tags: ['reactjs', 'redux', 'react-context', 'state-management'], upvotes: 1240, downvotes: 18, answers: 15, views: 890000, createdAt: '2025-11-05T12:00:00Z' },
  { oldUserId: 'user_4', title: 'How to fetch data in React with useEffect properly?', body: 'I am fetching data inside useEffect but getting warnings.', tags: ['reactjs', 'react-hooks', 'fetch', 'useeffect'], upvotes: 560, downvotes: 1, answers: 9, views: 178000, createdAt: '2026-02-20T08:45:00Z' },
  { oldUserId: 'user_5', title: 'What is the virtual DOM and how does React use it?', body: 'I understand React uses a "virtual DOM" for performance.', tags: ['reactjs', 'virtual-dom', 'dom', 'performance'], upvotes: 2340, downvotes: 8, answers: 14, views: 1560000, createdAt: '2025-07-20T11:00:00Z', category: 'Discussion' },
  { oldUserId: 'user_1', title: 'How to read a file line by line in Python?', body: 'I need to process a large text file line by line in Python.', tags: ['python', 'file-io', 'file-handling'], upvotes: 3150, downvotes: 10, answers: 20, views: 4500000, createdAt: '2025-03-08T10:00:00Z', category: 'Tutorial' },
  { oldUserId: 'user_2', title: 'What does if __name__ == "__main__" do in Python?', body: 'I see this pattern at the bottom of almost every Python script.', tags: ['python', 'main', 'modules'], upvotes: 5200, downvotes: 25, answers: 30, views: 7800000, createdAt: '2025-01-15T08:00:00Z' },
  { oldUserId: 'user_3', title: 'Flexbox vs CSS Grid — when to use which?', body: 'I understand both Flexbox and CSS Grid but I am never sure which one to use.', tags: ['css', 'flexbox', 'css-grid', 'layout'], upvotes: 1650, downvotes: 6, answers: 13, views: 1200000, createdAt: '2025-08-30T11:00:00Z', category: 'Discussion' },
  { oldUserId: 'user_4', title: 'TypeScript — interface vs type alias, what should I use?', body: 'I am starting a new TypeScript project and I am unsure.', tags: ['typescript', 'types', 'interface'], upvotes: 1560, downvotes: 8, answers: 14, views: 1120000, createdAt: '2025-07-25T10:30:00Z' },
  { oldUserId: 'user_5', title: 'How to structure a large Node.js Express application?', body: 'My Express app has grown to over 50 routes.', tags: ['node.js', 'express', 'architecture', 'project-structure'], upvotes: 1340, downvotes: 6, answers: 12, views: 890000, createdAt: '2025-08-08T11:30:00Z' },
  { oldUserId: 'user_1', title: 'JWT authentication — how to implement refresh tokens properly?', body: 'I have implemented JWT access tokens for my API.', tags: ['node.js', 'jwt', 'authentication', 'security'], upvotes: 890, downvotes: 4, answers: 10, views: 560000, createdAt: '2025-12-28T08:45:00Z', category: 'Best practices', bounty: 200 },
  { oldUserId: 'user_2', title: 'SQL JOIN types explained — INNER, LEFT, RIGHT, FULL', body: 'Can someone explain the different types of SQL JOINs?', tags: ['sql', 'join', 'database', 'mysql'], upvotes: 4200, downvotes: 15, answers: 25, views: 5600000, createdAt: '2025-02-20T09:00:00Z' },
  { oldUserId: 'user_3', title: 'How to undo the last Git commit without losing changes?', body: 'I just committed something and realized I need to make more changes.', tags: ['git', 'version-control', 'undo'], upvotes: 3400, downvotes: 8, answers: 18, views: 4200000, createdAt: '2025-03-15T10:00:00Z' },
  { oldUserId: 'user_4', title: 'Docker — what is the difference between CMD and ENTRYPOINT?', body: 'In a Dockerfile I can use both CMD and ENTRYPOINT.', tags: ['docker', 'dockerfile', 'containers', 'devops'], upvotes: 1560, downvotes: 5, answers: 12, views: 1100000, createdAt: '2025-07-14T11:45:00Z' },
  { oldUserId: 'user_5', title: 'Why is processing a sorted array faster than processing an unsorted array?', body: 'Sorting the data before the timed region makes the primary loop around 6x faster.', tags: ['java', 'c++', 'performance', 'cpu-architecture', 'branch-prediction'], upvotes: 27540, downvotes: 45, answers: 32, views: 1820000, createdAt: '2024-06-27T08:00:00Z' },
  { oldUserId: 'user_1', title: 'How do I undo the most recent local commits in Git?', body: 'I accidentally committed the wrong files to Git.', tags: ['git', 'version-control', 'git-commit', 'undo'], upvotes: 18200, downvotes: 30, answers: 65, views: 12400000, createdAt: '2024-07-15T10:30:00Z' },
  { oldUserId: 'user_2', title: 'What does the "yield" keyword do in Python?', body: 'What functionality does the yield keyword provide in Python?', tags: ['python', 'generators', 'yield', 'iterator'], upvotes: 12800, downvotes: 20, answers: 45, views: 8900000, createdAt: '2024-09-12T11:00:00Z' },
  { oldUserId: 'user_3', title: 'Is Java "pass-by-reference" or "pass-by-value"?', body: 'I always thought Java uses pass-by-reference.', tags: ['java', 'pass-by-value', 'pass-by-reference', 'parameter-passing'], upvotes: 7200, downvotes: 18, answers: 42, views: 5400000, createdAt: '2024-06-10T09:00:00Z' },
  { oldUserId: 'user_4', title: 'What is the difference between String and string in C#?', body: 'What are the differences between using string s = "Hello" and String s = "Hello"?', tags: ['c#', 'string', '.net', 'types'], upvotes: 5500, downvotes: 12, answers: 25, views: 4300000, createdAt: '2024-07-18T11:00:00Z' },
  { oldUserId: 'user_5', title: 'What are metaclasses in Python?', body: 'What are metaclasses in Python? What are they used for?', tags: ['python', 'metaclass', 'oop', 'python-3.x'], upvotes: 5800, downvotes: 12, answers: 22, views: 3400000, createdAt: '2024-06-05T09:00:00Z' },
  { oldUserId: 'user_1', title: 'How do I find all files containing a specific string on Linux?', body: 'I want to find all files under a directory containing a specific string.', tags: ['linux', 'bash', 'grep', 'command-line'], upvotes: 5100, downvotes: 8, answers: 25, views: 5600000, createdAt: '2024-06-15T10:30:00Z' },
  { oldUserId: 'user_2', title: 'How can I redirect the user to another page using JavaScript?', body: 'How can I redirect the user from one page to another?', tags: ['javascript', 'redirect', 'window-location'], upvotes: 4800, downvotes: 8, answers: 30, views: 5200000, createdAt: '2024-07-05T10:00:00Z' },
  { oldUserId: 'user_3', title: 'PUT vs POST in REST — what is the difference?', body: 'According to HTTP specs, POST is used to create a resource and PUT is used to create or replace one.', tags: ['rest', 'http', 'put', 'post'], upvotes: 4600, downvotes: 15, answers: 28, views: 3500000, createdAt: '2024-07-12T09:30:00Z' },
  { oldUserId: 'user_4', title: 'How does CSS specificity work?', body: 'I have two CSS rules targeting the same element and the one I expected to win is losing.', tags: ['css', 'specificity', 'selectors', 'cascade'], upvotes: 2600, downvotes: 5, answers: 15, views: 1800000, createdAt: '2024-06-28T10:30:00Z' },
  { oldUserId: 'user_5', title: 'What is the difference between concurrency and parallelism?', body: 'I keep confusing concurrency and parallelism.', tags: ['concurrency', 'parallelism', 'multithreading', 'computer-science'], upvotes: 2400, downvotes: 5, answers: 14, views: 1400000, createdAt: '2024-06-08T14:00:00Z' },
  { oldUserId: 'user_1', title: 'How to use regular expressions — a beginner guide', body: 'Regular expressions look like hieroglyphics to me.', tags: ['regex', 'regular-expressions', 'pattern-matching', 'string'], upvotes: 3000, downvotes: 8, answers: 20, views: 2400000, createdAt: '2024-07-15T09:00:00Z' },
  { oldUserId: 'user_2', title: 'Kubernetes — Pod vs Deployment vs Service?', body: 'I am new to Kubernetes and confused by all the resource types.', tags: ['kubernetes', 'docker', 'containers', 'devops'], upvotes: 2400, downvotes: 4, answers: 14, views: 1200000, createdAt: '2024-07-25T10:00:00Z' },
  { oldUserId: 'user_3', title: 'How to set up a CI/CD pipeline with GitHub Actions?', body: 'I want to automate my deployment process using GitHub Actions.', tags: ['github-actions', 'ci-cd', 'devops', 'deployment'], upvotes: 1800, downvotes: 3, answers: 12, views: 890000, createdAt: '2024-10-30T09:30:00Z' },
  { oldUserId: 'user_4', title: 'What is the difference between unit tests, integration tests, and E2E tests?', body: 'I know I should write tests but I am confused about the different levels.', tags: ['testing', 'unit-testing', 'integration-testing', 'e2e'], upvotes: 2000, downvotes: 4, answers: 14, views: 1200000, createdAt: '2024-07-20T10:30:00Z' },
  { oldUserId: 'user_5', title: 'Microservices vs Monolith — when to use which?', body: 'My team is debating whether to build our new app as microservices.', tags: ['microservices', 'architecture', 'monolith', 'software-engineering'], upvotes: 2000, downvotes: 8, answers: 14, views: 1200000, createdAt: '2024-08-28T10:30:00Z' },
];

const MOCK_POSTS = [
  { oldUserId: 'user_2', content: 'Just shipped a new feature! 🚀', likes: ['user_1', 'user_3'], comments: [{ oldUserId: 'user_1', text: 'Awesome work!', createdAt: '2026-04-04T11:30:00Z' }], shares: 2, createdAt: '2026-04-04T11:00:00Z' },
  { oldUserId: 'user_3', content: 'Learning React Router v6 — loving the new data APIs!', likes: ['user_1', 'user_2', 'user_5'], comments: [], shares: 1, createdAt: '2026-04-03T16:00:00Z' },
];

// ── Seed Function ───────────────────────────────────────

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Post.deleteMany({});

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const userIdMap = {}; // oldId -> mongoId

    for (const u of MOCK_USERS) {
      const user = await User.create({
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        phone: u.phone,
        password: u.password,
        plan: u.plan,
        points: u.points,
        language: u.language,
        joinDate: u.joinDate,
      });

      userIdMap[u.oldId] = user._id;
      console.log(`  ✓ ${u.displayName} (${u.oldId} → ${user._id})`);
    }

    // 2. Update friends
    console.log('🤝 Setting up friendships...');
    for (const [oldId, friendOldIds] of Object.entries(FRIEND_MAP)) {
      const mongoId = userIdMap[oldId];
      const friendMongoIds = friendOldIds
        .map(fId => userIdMap[fId])
        .filter(Boolean);

      await User.findByIdAndUpdate(mongoId, { friends: friendMongoIds });
    }
    console.log('  ✓ Friendships established');

    // 3. Seed Questions
    console.log('❓ Seeding questions...');
    let qCount = 0;
    for (const q of MOCK_QUESTIONS) {
      await Question.create({
        userId: userIdMap[q.oldUserId],
        title: q.title,
        body: q.body,
        tags: q.tags,
        upvotes: q.upvotes || 0,
        downvotes: q.downvotes || 0,
        answerCount: q.answers || 0,
        views: q.views || 0,
        category: q.category || null,
        bounty: q.bounty || 0,
        createdAt: new Date(q.createdAt),
        lastActive: new Date(q.createdAt),
      });
      qCount++;
    }
    console.log(`  ✓ ${qCount} questions seeded`);

    // 4. Seed Posts
    console.log('📝 Seeding social posts...');
    for (const p of MOCK_POSTS) {
      const likeIds = p.likes.map(oldId => userIdMap[oldId]).filter(Boolean);
      const comments = p.comments.map(c => ({
        userId: userIdMap[c.oldUserId],
        text: c.text,
        createdAt: new Date(c.createdAt),
      }));

      await Post.create({
        userId: userIdMap[p.oldUserId],
        content: p.content,
        likes: likeIds,
        comments,
        shares: p.shares || 0,
        createdAt: new Date(p.createdAt),
      });
    }
    console.log(`  ✓ ${MOCK_POSTS.length} posts seeded`);

    console.log('\n🎉 Seeding complete!');
    console.log(`   Users:     ${MOCK_USERS.length}`);
    console.log(`   Questions: ${qCount}`);
    console.log(`   Posts:     ${MOCK_POSTS.length}`);

    // Print login credentials
    console.log('\n🔑 Login credentials (all passwords: "password"):');
    for (const u of MOCK_USERS.slice(0, 5)) {
      console.log(`   ${u.email} — ${u.displayName}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
