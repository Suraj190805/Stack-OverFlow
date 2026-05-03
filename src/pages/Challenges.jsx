import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Challenges.css';

// Mock challenges data with rich explanations
const CHALLENGES_DATA = [
  {
    id: 'ch18', number: 18, title: 'Hidden in Plain Sight',
    description: 'We are experimenting with more community authored Challenges, if you are interested in writing your own challenge, please head to the sandbox and post your idea there. This challenge was inspired by steganography — the practice of concealing messages within other non-secret data.',
    authorBio: 'André is an expert in medical image processing, doing research and development in Python and C++, and also teaches digital image processing at the university level. André has successfully completed 5 previous coding challenges so far.',
    background: '**Steganography** is the art of hiding information within other data. One common approach is hiding messages in images by manipulating pixels without perceivable change.\n\n**Digital images** are made up of **pixels**, and each pixel contains color information. In most common formats (PNG, BMP), each pixel is represented using the **RGB color model**, where:\n• R = Red intensity (0–255)\n• G = Green intensity (0–255)\n• B = Blue intensity (0–255)\n\nEach color component is stored as **8 bits**, meaning one pixel typically occupies **24 bits**.',
    tasks: [
      { title: 'Task 1: Decode a simple text message', desc: 'An ASCII text message is hidden in the least significant bits of a cat image. Use Simple LSB Encoding with header [0, 0], followed by 16-bit message length, then the message itself as 8-bit ASCII characters.' },
      { title: 'Task 2: Encode your own message', desc: 'Write an encode function that takes an image and a message string, and returns a new image with the message hidden using LSB steganography.' },
      { title: 'Task 3: Multi-channel encoding (Bonus)', desc: 'Extend your solution to use all three color channels (R, G, B) for encoding, tripling the message capacity.' },
    ],
    tags: ['image-processing', 'pixel', 'steganography'],
    author: 'gee3107', authorRep: 427, votes: 37, views: 2000, entries: 38,
    status: 'active', createdAt: '2026-04-30T08:00:00Z', lastActivity: '16 hours ago',
    sampleEntries: [
      { id: 'se1', author: 'Sasha', authorRep: 101, votes: 18, body: '## Solution\n\n1. The hidden quote is "Three may keep a secret, if two of them are dead", Benjamin Franklin\n2. What is on the line? A key or a kite at the end\n3. Encoded using LSB on red channel only\n\n```python\ndef decode_lsb(image):\n    bits = [pixel[0] & 1 for row in image for pixel in row]\n    length = int("".join(map(str, bits[16:32])), 2)\n    chars = [chr(int("".join(map(str, bits[32+i*8:40+i*8])), 2)) for i in range(length)]\n    return "".join(chars)\n```' },
      { id: 'se2', author: 'CodeNinja', authorRep: 890, votes: 12, body: '## My Approach\n\nUsed a bitwise approach reading LSB from each R channel value:\n\n```javascript\nfunction decode(pixels) {\n  const bits = pixels.flat().map(p => p[0] & 1);\n  const len = parseInt(bits.slice(16,32).join(""), 2);\n  let msg = "";\n  for (let i = 0; i < len; i++) {\n    msg += String.fromCharCode(parseInt(bits.slice(32+i*8, 40+i*8).join(""), 2));\n  }\n  return msg;\n}\n```' },
    ],
  },
  {
    id: 'ch17', number: 17, title: 'The Maze Runner',
    description: 'Generate and solve randomly created mazes using various pathfinding algorithms. Compare efficiency of BFS, DFS, A*, and Dijkstra approaches.',
    authorBio: 'AlgoMaster is a competitive programmer with expertise in graph theory and optimization. He regularly contributes educational content about algorithms.',
    background: 'A **maze** is a structure consisting of paths and walls where the goal is to find a route from start to finish. Mazes are excellent for studying **graph traversal** algorithms.\n\nA **perfect maze** has exactly one path between any two cells — no loops and no isolated sections. The most common generation algorithms are:\n• **Recursive Backtracking** — Uses DFS to carve passages\n• **Kruskal\'s Algorithm** — Randomly removes walls between disjoint sets\n• **Prim\'s Algorithm** — Grows the maze from a starting cell',
    tasks: [
      { title: 'Task 1: Maze Generation', desc: 'Implement a maze generator using recursive backtracking. The maze should be represented as a 2D grid where each cell tracks its walls (top, right, bottom, left).' },
      { title: 'Task 2: Solve with BFS and DFS', desc: 'Implement both BFS and DFS to find a path from top-left to bottom-right. Track cells visited and path length.' },
      { title: 'Task 3: A* Pathfinding (Bonus)', desc: 'Implement A* with Manhattan distance heuristic. Compare performance metrics against BFS/DFS.' },
    ],
    tags: ['algorithm', 'pathfinding', 'graph-theory', 'maze'],
    author: 'AlgoMaster', authorRep: 1850, votes: 54, views: 4200, entries: 61,
    status: 'voting', createdAt: '2026-04-22T12:00:00Z', lastActivity: '2 days ago',
    sampleEntries: [
      { id: 'se3', author: 'GraphGuru', authorRep: 2100, votes: 24, body: '## BFS vs DFS Comparison\n\nTested on 50x50 maze:\n- **BFS**: 847 cells visited, path length 156, 2.3ms\n- **DFS**: 1204 cells visited, path length 198, 1.8ms\n- **A***: 312 cells visited, path length 156, 1.1ms\n\nA* finds optimal path with fewest cells explored!' },
    ],
  },
  {
    id: 'ch16', number: 16, title: 'Build a Tiny Regex Engine',
    description: 'Implement a minimal regular expression engine that supports basic pattern matching including literal characters, dot (any character), star (zero or more), and plus (one or more) quantifiers.',
    authorBio: 'CompilerWiz teaches compiler design at Stanford and has contributed to LLVM. He believes regex engines are the perfect intro to language theory.',
    background: 'Regular expressions are patterns that describe sets of strings. Under the hood, they are powered by **finite automata** — mathematical models of computation.\n\nA regex engine converts a pattern into an **NFA** (Non-deterministic Finite Automaton) or **DFA** (Deterministic Finite Automaton) and then simulates it against the input string.',
    tasks: [
      { title: 'Task 1: Literal and dot matching', desc: 'Match literal characters and the . wildcard (any single character). match("h.t", "hat") → true' },
      { title: 'Task 2: Quantifiers', desc: 'Support * (zero or more), + (one or more), and ? (zero or one). match("ab*c", "ac") → true, match("ab*c", "abbc") → true' },
      { title: 'Task 3: Character classes', desc: 'Support [abc] syntax for matching one of a set of characters. match("[aeiou]", "e") → true' },
    ],
    tags: ['regex', 'parsing', 'string-matching', 'automata'],
    author: 'CompilerWiz', authorRep: 3200, votes: 89, views: 6800, entries: 47,
    status: 'completed', createdAt: '2026-04-15T10:00:00Z', lastActivity: '1 week ago',
    sampleEntries: [],
  },
  {
    id: 'ch15', number: 15, title: 'Compression Challenge',
    description: 'Implement a lossless data compression algorithm from scratch. Compress and decompress arbitrary text data while achieving a meaningful compression ratio.',
    authorBio: 'ByteCrunch specializes in data encoding and has worked on video compression codecs at a major streaming company.',
    background: 'Data compression reduces the number of bits needed to represent information. **Lossless** compression guarantees perfect reconstruction of the original data.\n\nCommon algorithms include:\n• **Huffman Coding** — Variable-length codes based on character frequency\n• **LZ77/LZ78** — Dictionary-based compression using sliding windows\n• **Run-Length Encoding** — Replaces consecutive identical values with count+value',
    tasks: [
      { title: 'Task 1: Implement Huffman coding', desc: 'Build a Huffman tree from character frequencies easured, generate codes, and encode/decode text.' },
      { title: 'Task 2: Measure compression ratio', desc: 'Test on various inputs and report original vs compressed size. Target: >30% compression on English text.' },
    ],
    tags: ['compression', 'algorithm', 'huffman', 'encoding'],
    author: 'ByteCrunch', authorRep: 2100, votes: 72, views: 5100, entries: 33,
    status: 'completed', createdAt: '2026-04-08T09:00:00Z', lastActivity: '2 weeks ago',
    sampleEntries: [],
  },
  {
    id: 'ch14', number: 14, title: 'JSON Parser from Scratch',
    description: 'Build a complete JSON parser without using any built-in JSON parsing functions. Handle all valid JSON types.',
    authorBio: 'ParsePro builds developer tools and is passionate about language parsing and syntax analysis.',
    background: 'JSON (JavaScript Object Notation) is the most common data interchange format on the web. A parser must handle:\n• **Objects** { } — key-value pairs\n• **Arrays** [ ] — ordered lists\n• **Strings** " " — with escape sequences\n• **Numbers** — integers and floats\n• **Booleans** — true/false\n• **Null** — null value',
    tasks: [
      { title: 'Task 1: Tokenizer', desc: 'Break JSON string into tokens: braces, brackets, colons, commas, strings, numbers, booleans, null.' },
      { title: 'Task 2: Recursive descent parser', desc: 'Parse the token stream into a nested data structure using recursive descent.' },
      { title: 'Task 3: Error handling', desc: 'Provide meaningful error messages with line/column for invalid JSON input.' },
    ],
    tags: ['json', 'parser', 'string-processing', 'recursion'],
    author: 'ParsePro', authorRep: 945, votes: 63, views: 4800, entries: 52,
    status: 'completed', createdAt: '2026-04-01T11:00:00Z', lastActivity: '3 weeks ago',
    sampleEntries: [],
  },
  {
    id: 'ch13', number: 13, title: 'Tiny Database Engine',
    description: 'Create a simple in-memory database that supports basic SQL-like queries: SELECT, INSERT, UPDATE, DELETE with WHERE clauses.',
    authorBio: 'DBNinja has 10+ years building database internals and loves teaching system design fundamentals.',
    background: 'Every database engine has core components:\n• **Storage** — How data is organized in memory\n• **Query Parser** — Translates SQL-like strings into operations\n• **Executor** — Performs the actual data manipulation\n\nBuilding one from scratch teaches fundamental CS concepts about data structures and query optimization.',
    tasks: [
      { title: 'Task 1: Schema & INSERT', desc: 'Define table schemas and implement INSERT to add records to your in-memory store.' },
      { title: 'Task 2: SELECT with WHERE', desc: 'Implement SELECT queries with filtering: SELECT * FROM users WHERE age > 25' },
      { title: 'Task 3: UPDATE & DELETE', desc: 'Implement UPDATE and DELETE with WHERE clause support.' },
    ],
    tags: ['database', 'sql', 'data-structures', 'query-engine'],
    author: 'DBNinja', authorRep: 1650, votes: 91, views: 7200, entries: 44,
    status: 'completed', createdAt: '2026-03-25T14:00:00Z', lastActivity: '1 month ago',
    sampleEntries: [],
  },
];

// Challenge guidelines
const GUIDELINES = [
  {
    title: 'Enter the challenge and share!',
    body: 'Use challenges to gain new skills and engage with the community to share your take on the answer! Keep your entries on topic for the best chance to win.',
  },
  {
    title: 'Upvote the best answer',
    body: 'Cast your upvote for the best answer! See all entries once the voting period starts. Or, submit your own now for an early comparison.',
  },
  {
    title: 'Be welcoming and patient',
    body: 'We expect all users to treat one another with kindness and respect. Remember, everyone is here to learn, and sometimes while learning, people make mistakes.',
  },
  {
    title: 'No resume or job listings',
    body: 'Challenges are not for sharing your resume or job listing.',
  },
  {
    title: 'No overt self-promotion',
    body: 'If your post happens to be about your product or website, you must disclose your affiliation. See spam guidelines and best practices.',
  },
];

export default function Challenges() {
  const { currentUser, getUserById } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [showPromo, setShowPromo] = useLocalStorage('so_challenges_promo', true);
  const [feedback, setFeedback] = useLocalStorage('so_challenges_feedback', null);
  const [sortBy, setSortBy] = useState('newest');
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [openGuidelines, setOpenGuidelines] = useState({});
  const [entryTexts, setEntryTexts] = useState({});
  const [entries, setEntries] = useLocalStorage('so_challenge_entries', {});
  const [entryVotes, setEntryVotes] = useLocalStorage('so_challenge_entry_votes', {});

  const displayedChallenges = useMemo(() => {
    let result = [...CHALLENGES_DATA];
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'votes':
        result.sort((a, b) => b.votes - a.votes);
        break;
      case 'most-entries':
        result.sort((a, b) => b.entries - a.entries);
        break;
      case 'active':
        result.sort((a, b) => {
          const statusOrder = { active: 0, voting: 1, completed: 2 };
          return (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
        });
        break;
      default:
        break;
    }
    return result;
  }, [sortBy]);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  };

  const toggleGuideline = (index) => {
    setOpenGuidelines(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitEntry = (challengeId) => {
    const text = entryTexts[challengeId]?.trim();
    if (!text) return;
    const entry = {
      id: `entry_${Date.now()}`,
      challengeId,
      userId: currentUser.id,
      body: text,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => ({
      ...prev,
      [challengeId]: [...(prev[challengeId] || []), entry],
    }));
    setEntryTexts(prev => ({ ...prev, [challengeId]: '' }));
    toast.success('Entry submitted! 🚀');
  };

  const handleVoteEntry = (challengeId, entryId) => {
    const voteKey = `${challengeId}_${entryId}`;
    if (entryVotes[voteKey]) {
      // Remove vote
      setEntries(prev => ({
        ...prev,
        [challengeId]: (prev[challengeId] || []).map(e =>
          e.id === entryId ? { ...e, votes: Math.max(0, e.votes - 1) } : e
        ),
      }));
      setEntryVotes(prev => { const c = { ...prev }; delete c[voteKey]; return c; });
      toast.info('Vote removed');
    } else {
      setEntries(prev => ({
        ...prev,
        [challengeId]: (prev[challengeId] || []).map(e =>
          e.id === entryId ? { ...e, votes: e.votes + 1 } : e
        ),
      }));
      setEntryVotes(prev => ({ ...prev, [voteKey]: true }));
      toast.success('Upvoted! 👍');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return t('challenges.acceptingEntries');
      case 'voting': return t('challenges.votingPhase');
      case 'completed': return t('challenges.completed');
      default: return status;
    }
  };

  return (
    <div className="challenges-layout" id="challenges-page">
      {/* Main Content */}
      <div className="challenges-main">
        {/* Header */}
        <div className="challenges-header">
          <h1 className="challenges-header__title">{t('challenges.title')}</h1>
          <p className="challenges-header__subtitle">
            {t('challenges.subtitle')}{' '}
            <a href="#" onClick={e => e.preventDefault()}>{t('challenges.joinChat')}</a> {t('challenges.toDiscuss')}
          </p>
        </div>

        {/* Promo Banner */}
        {showPromo && (
          <div className="challenges-promo">
            <button className="challenges-promo__close" onClick={() => setShowPromo(false)}>✕</button>
            <h2 className="challenges-promo__title">{t('challenges.newGrowSkills')}</h2>
            <p className="challenges-promo__text">
              {t('challenges.promoText')}
            </p>
            <div className="challenges-promo__steps">
              <div className="challenges-promo__step">
                <div className="challenges-promo__step-icon challenges-promo__step-icon--entry">⊕</div>
                <div className="challenges-promo__step-content">
                  <h4>{t('challenges.addEntry')}</h4>
                  <p>{t('challenges.addEntryDesc')}</p>
                </div>
              </div>
              <div className="challenges-promo__step">
                <div className="challenges-promo__step-icon challenges-promo__step-icon--vote">▲</div>
                <div className="challenges-promo__step-content">
                  <h4>{t('challenges.discussVote')}</h4>
                  <p>{t('challenges.discussVoteDesc')}</p>
                </div>
              </div>
              <div className="challenges-promo__step">
                <div className="challenges-promo__step-icon challenges-promo__step-icon--award">🏆</div>
                <div className="challenges-promo__step-content">
                  <h4>{t('challenges.awards')}</h4>
                  <p>{t('challenges.awardsDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="challenges-feedback">
          <span className="challenges-feedback__text">
            {t('challenges.interested')}
          </span>
          <div className="challenges-feedback__btns">
            <button
              className={`challenges-feedback__btn challenges-feedback__btn--yes ${feedback === 'yes' ? 'active' : ''}`}
              onClick={() => { setFeedback('yes'); toast.success('Thanks for your feedback!'); }}
            >
              👍 {t('challenges.yes')}
            </button>
            <button
              className={`challenges-feedback__btn challenges-feedback__btn--no ${feedback === 'no' ? 'active' : ''}`}
              onClick={() => { setFeedback('no'); toast.info('Thanks for your feedback!'); }}
            >
              👎 {t('challenges.no')}
            </button>
          </div>
        </div>

        {/* Info Bar */}
        <div className="challenges-info">
          <span className="challenges-info__count">{t('challenges.challengeCount', { count: displayedChallenges.length })}</span>
          <div className="challenges-info__sort">
            <span>{t('challenges.sortedBy')}</span>
            <select
              className="challenges-info__sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">{t('challenges.newest')}</option>
              <option value="votes">{t('challenges.mostVotes')}</option>
              <option value="most-entries">{t('challenges.mostEntries')}</option>
              <option value="active">{t('challenges.status')}</option>
            </select>
          </div>
        </div>

        {/* Challenge List */}
        <div className="challenges-list">
          {displayedChallenges.map((ch, idx) => {
            const isExpanded = expandedChallenge === ch.id;
            const chEntries = entries[ch.id] || [];

            return (
              <div className="challenge-item" key={ch.id} style={{ animationDelay: `${idx * 0.03}s` }}>
                {/* Stats */}
                <div className="challenge-item__stats">
                  <div className="challenge-item__stat">
                    <span className="challenge-item__stat-value">{ch.votes}</span> {t('challenges.votes')}
                  </div>
                  <div className="challenge-item__stat">
                    <span className="challenge-item__stat-value">{formatCount(ch.views)}</span> {t('challenges.views')}
                  </div>
                  <div className={`challenge-item__stat ${ch.status === 'active' ? 'challenge-item__stat--entries' : ''}`}>
                    <span className="challenge-item__stat-value">{ch.entries + chEntries.length}</span> {t('challenges.entries')}
                  </div>
                </div>

                {/* Content */}
                <div className="challenge-item__content">
                  <span className={`challenge-item__status challenge-item__status--${ch.status}`}>
                    {getStatusLabel(ch.status)}
                  </span>

                  <h3
                    className="challenge-item__title"
                    onClick={() => setExpandedChallenge(isExpanded ? null : ch.id)}
                  >
                    {t('challenges.challenge')} #{ch.number}: {ch.title}
                  </h3>

                  <p className="challenge-item__desc">{ch.description}</p>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="challenge-detail">
                      {/* Challenge Body with Vote Controls */}
                      <div className="challenge-detail__layout">
                        <div className="challenge-detail__vote-col">
                          <button className="so-vote-btn" title="Upvote">▲</button>
                          <span className="so-vote-count">{ch.votes}</span>
                          <button className="so-vote-btn" title="Downvote">▼</button>
                          <button className="challenge-detail__share-btn" title="Share">↻</button>
                        </div>
                        <div className="challenge-detail__content-col">
                          {/* Description */}
                          <p className="challenge-detail__body">{ch.description}</p>

                          {/* Author Bio */}
                          {ch.authorBio && (
                            <div className="challenge-detail__author-bio">
                              <strong>{t('challenges.theAuthor')} </strong>
                              <span className="challenge-detail__author-link">{ch.author}</span> — {ch.authorBio}
                            </div>
                          )}

                          {/* Background */}
                          {ch.background && (
                            <div className="challenge-detail__section">
                              <h3 className="challenge-detail__section-title">{t('challenges.background')}</h3>
                              {ch.background.split('\n').map((line, i) => (
                                <p key={i} className="challenge-detail__paragraph" dangerouslySetInnerHTML={{
                                  __html: line
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/• /g, '<br/>• ')
                                }} />
                              ))}
                            </div>
                          )}

                          {/* Tasks */}
                          {ch.tasks && ch.tasks.length > 0 && (
                            <div className="challenge-detail__section">
                              {ch.tasks.map((task, i) => (
                                <div key={i} className="challenge-detail__task">
                                  <h4 className="challenge-detail__task-title">{task.title}</h4>
                                  <p className="challenge-detail__task-desc">{task.desc}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Rules */}
                          <div className="challenge-detail__rules">
                            <h4>{t('challenges.rules')}</h4>
                            <ul>
                              <li>{t('challenges.rule1')}</li>
                              <li>{t('challenges.rule2')}</li>
                              <li>{t('challenges.rule3')}</li>
                              <li>{t('challenges.rule4')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Add Entry Form */}
                      <div className="challenge-entry-form">
                        <h4>{t('challenges.addEntry')}</h4>
                        <textarea
                          placeholder={t('challenges.writeSolution')}
                          value={entryTexts[ch.id] || ''}
                          onChange={e => setEntryTexts(prev => ({ ...prev, [ch.id]: e.target.value }))}
                        />
                        <button
                          className="btn btn--primary"
                          onClick={() => handleSubmitEntry(ch.id)}
                          disabled={!entryTexts[ch.id]?.trim()}
                        >
                          {t('saves.add')}
                        </button>
                      </div>

                      {/* All Entries (sample + user) */}
                      {(() => {
                        const allEntries = [
                          ...(ch.sampleEntries || []).map(e => ({ ...e, isSample: true })),
                          ...chEntries.map(e => ({ ...e, isSample: false, author: currentUser?.displayName || 'You', authorRep: 1 })),
                        ].sort((a, b) => b.votes - a.votes);
                        const totalEntries = ch.entries + chEntries.length;
                        if (allEntries.length === 0) return null;
                        return (
                          <div className="challenge-entries">
                            <div className="challenge-entries__header">
                              <h4 className="challenge-entries__title">{totalEntries} {t('challenges.entries')}</h4>
                              <div className="challenge-entries__sort">
                                <span>{t('challenges.sortedBy')}</span>
                                <select className="challenges-info__sort-select" defaultValue="newest">
                                  <option value="newest">{t('challenges.newestFirst')}</option>
                                  <option value="votes">{t('challenges.mostVotes')}</option>
                                </select>
                              </div>
                            </div>
                            {allEntries.map(entry => {
                              const voteKey = `${ch.id}_${entry.id}`;
                              const voted = !!entryVotes[voteKey];
                              return (
                                <div className="challenge-entry" key={entry.id}>
                                  <div className="challenge-entry__layout">
                                    <div className="challenge-entry__vote-col">
                                      <button
                                        className={`so-vote-btn so-vote-btn--sm ${voted ? 'so-vote-btn--active-up' : ''}`}
                                        onClick={() => handleVoteEntry(ch.id, entry.id)}
                                        title="Upvote"
                                      >▲</button>
                                      <span className="challenge-entry__vote-count">{entry.votes}</span>
                                      <button className="so-vote-btn so-vote-btn--sm" title="Downvote">▼</button>
                                    </div>
                                    <div className="challenge-entry__body-col">
                                      <div className="challenge-entry__author-row">
                                        <div className="challenge-item__author-avatar">{entry.author.charAt(0).toUpperCase()}</div>
                                        <span className="challenge-item__author-name">{entry.author}</span>
                                        <span className="challenge-item__author-rep">{entry.authorRep}</span>
                                      </div>
                                      <div className="challenge-entry__code">{entry.body}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="challenge-item__meta">
                    <div className="challenge-item__tags">
                      {ch.tags.map(tag => (
                        <span key={tag} className="s-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="challenge-item__author">
                      <div className="challenge-item__author-avatar">
                        {ch.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="challenge-item__author-name">{ch.author}</span>
                      <span className="challenge-item__author-rep">{ch.authorRep}</span>
                      <span>{t('challenges.responded')} {ch.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar — Guidelines */}
      <aside className="challenges-sidebar">
        <div className="challenges-guidelines">
          <div className="challenges-guidelines__header">{t('challenges.guidelines')}</div>
          <ul className="challenges-guidelines__list">
            {[
              { title: t('challenges.guideline1Title'), body: t('challenges.guideline1Body') },
              { title: t('challenges.guideline2Title'), body: t('challenges.guideline2Body') },
              { title: t('challenges.guideline3Title'), body: t('challenges.guideline3Body') },
              { title: t('challenges.guideline4Title'), body: t('challenges.guideline4Body') },
              { title: t('challenges.guideline5Title'), body: t('challenges.guideline5Body') },
            ].map((g, i) => (
              <li key={i} className="challenges-guidelines__item">
                <button
                  className="challenges-guidelines__toggle"
                  onClick={() => toggleGuideline(i)}
                >
                  <span className={`challenges-guidelines__toggle-arrow ${openGuidelines[i] ? 'challenges-guidelines__toggle-arrow--open' : ''}`}>
                    ▶
                  </span>
                  {g.title}
                </button>
                {openGuidelines[i] && (
                  <div className="challenges-guidelines__body">
                    {g.body}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
