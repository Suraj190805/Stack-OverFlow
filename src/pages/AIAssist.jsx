import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './AIAssist.css';

// System prompt to make AI behave like Stack Overflow AI Assist
const SYSTEM_PROMPT = `You are Stack Overflow's AI Assist — a helpful programming assistant grounded in community-verified knowledge.

Key behaviors:
- Give concise, accurate, and well-structured answers to programming questions
- Include code examples when relevant, using proper formatting with backtick code blocks
- Reference common best practices and patterns used by the community
- If you're not sure about something, say so honestly
- Format responses with markdown: use headings, bullet points, code blocks, bold, etc.
- Keep answers focused and practical — developers want solutions, not essays
- When explaining concepts, use clear examples
- Mention relevant technologies, libraries, or tools when appropriate`;

// Parse basic markdown to HTML
function parseMarkdown(text) {
  if (!text) return '';

  let html = text;

  // Code blocks (triple backtick)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs (split by double newline)
  html = html.replace(/\n\n/g, '</p><p>');

  // Single newlines to <br> (except inside pre/code)
  html = html.replace(/(?<!<\/pre>|<\/code>|<\/li>|<\/h[123]>|<\/ul>|<\/p>)\n(?!<pre|<code|<li|<h[123]|<ul|<p)/g, '<br/>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  return html;
}

export default function AIAssist() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatRef = useRef(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Chat history stored in localStorage
  const [chatHistory, setChatHistory] = useLocalStorage('so_ai_chats', []);
  const [activeChatId, setActiveChatId] = useState(null);

  // Get active chat messages
  const activeChat = chatHistory.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  // Initialize Gemini
  const getModel = useCallback(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Handle query from URL (e.g., from Home page banner)
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuerySent = useRef(false);
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !initialQuerySent.current) {
      initialQuerySent.current = true;
      setSearchParams({}, { replace: true }); // Clear the URL param
      // Small delay to ensure state is ready
      setTimeout(() => sendMessage(q), 100);
    }
  }, [searchParams]);

  const createNewChat = (firstMessage = null) => {
    const id = 'chat_' + Date.now();
    const newChat = {
      id,
      title: firstMessage ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '') : 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(id);
    setError('');
    return id;
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Check for API key
    const model = getModel();
    if (!model) {
      setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/apikey');
      return;
    }

    setInput('');
    setError('');

    // Create chat if no active chat
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat(text);
    }

    // Add user message
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    setChatHistory(prev =>
      prev.map(c => c.id === chatId
        ? {
            ...c,
            title: c.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : c.title,
            messages: [...c.messages, userMsg],
          }
        : c
      )
    );

    setIsLoading(true);

    try {
      // Build prompt with conversation context
      const currentChat = chatHistory.find(c => c.id === chatId);
      const history = currentChat?.messages || [];

      // Build a single prompt with context
      let prompt = SYSTEM_PROMPT + '\n\n';
      if (history.length > 0) {
        prompt += 'Previous conversation:\n';
        history.forEach(m => {
          prompt += m.role === 'user' ? `User: ${m.text}\n` : `Assistant: ${m.text}\n`;
        });
        prompt += '\n';
      }
      prompt += `User: ${text}\nAssistant:`;

      const result = await model.generateContent(prompt);
      const aiText = result.response.text();

      // Add AI response
      const aiMsg = { role: 'ai', text: aiText, timestamp: new Date().toISOString() };
      setChatHistory(prev =>
        prev.map(c => c.id === chatId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
        )
      );
    } catch (err) {
      console.error('AI Assist error:', err);
      console.error('Error details:', err.message, err.status, JSON.stringify(err));
      let errorMsg = `Something went wrong: ${err.message || 'Unknown error'}`;
      if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
        errorMsg = 'Invalid API key. Check your VITE_GEMINI_API_KEY in .env file.';
      } else if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate')) {
        errorMsg = 'Rate limit reached. Please wait 60 seconds and try again.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('Failed')) {
        errorMsg = 'Network error. Check your internet connection.';
      }
      setError(errorMsg);

      // Add error message to chat
      const errMsg = { role: 'ai', text: `⚠️ ${errorMsg}`, timestamp: new Date().toISOString(), isError: true };
      setChatHistory(prev =>
        prev.map(c => c.id === chatId
          ? { ...c, messages: [...c.messages, errMsg] }
          : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const suggestions = [
    t('aiAssist.suggestion1'),
    t('aiAssist.suggestion2'),
    t('aiAssist.suggestion3'),
    t('aiAssist.suggestion4'),
  ];

  return (
    <div className="ai-assist-layout" id="ai-assist-page">
      {/* Left Sidebar */}
      <aside className="ai-sidebar">
        <Link to="/home" className="ai-sidebar__back">
          <svg viewBox="0 0 14 14" fill="currentColor"><path d="M12 7H2m0 0 4-4M2 7l4 4"/></svg>
          {t('aiAssist.back')}
        </Link>

        <button
          className="ai-sidebar__new-chat"
          onClick={() => { setActiveChatId(null); setError(''); }}
          id="btn-new-chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h8l4 4v8H2V2Zm3 5h6v1H5V7Zm0 3h6v1H5v-1Zm0-6h4v1H5V4Z"/>
          </svg>
          {t('aiAssist.newChat')}
        </button>

        <hr className="ai-sidebar__divider" />

        <div className="ai-sidebar__section-title">{t('aiAssist.recentChats')}</div>
        <div className="ai-sidebar__chat-list">
          {chatHistory.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {t('aiAssist.noChats')}
            </div>
          ) : (
            chatHistory.map(chat => (
              <button
                key={chat.id}
                className={`ai-sidebar__chat-item ${activeChatId === chat.id ? 'ai-sidebar__chat-item--active' : ''}`}
                onClick={() => { setActiveChatId(chat.id); setError(''); }}
              >
                <svg className="ai-sidebar__chat-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 3c0-.6.4-1 1-1h12c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H6l-3 2v-2H2c-.6 0-1-.4-1-1V3Z"/>
                </svg>
                {chat.title}
              </button>
            ))
          )}
        </div>

        <div className="ai-sidebar__about">
          <div className="ai-sidebar__about-title">{t('aiAssist.aboutAIAssist')}</div>
          <a href="https://stackoverflow.com/help/ai-assist" target="_blank" rel="noopener noreferrer" className="ai-sidebar__about-link">
            {t('aiAssist.learnMore')}
          </a>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="ai-main" ref={chatRef}>
        {/* Header */}
        <div className="ai-chat-header">
          <h1 className="ai-chat-header__title">
            <span className="ai-chat-header__icon">✦</span>
            {t('aiAssist.title')}
          </h1>
          <div className="ai-chat-header__actions">
            <button className="ai-chat-header__share-btn" onClick={() => toast.info('Share link copied!')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11 9a2.5 2.5 0 0 0-1.9.9L5.4 7.8a2.5 2.5 0 0 0 0-1.6l3.7-2.1A2.5 2.5 0 1 0 8.3 2.5a2.5 2.5 0 0 0 .1.8L4.7 5.4A2.5 2.5 0 1 0 4.7 8.6l3.7 2.1a2.5 2.5 0 0 0-.1.8 2.5 2.5 0 1 0 2.7-2.5Z"/>
              </svg>
              {t('aiAssist.share')}
            </button>
          </div>
        </div>

        {/* Messages or Welcome State */}
        {!activeChatId || messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome__icon">✦</div>
            <h2 className="ai-welcome__title">
              {t('aiAssist.hello')}{currentUser ? `, ${currentUser.displayName?.split(' ')[0]}` : ''}!
            </h2>
            <p className="ai-welcome__subtitle">
              {t('aiAssist.getInstantAnswers')}
            </p>
            <div className="ai-welcome__suggestions">
              <p className="ai-welcome__suggestion-title">{t('aiAssist.howCanIHelp')}</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="ai-welcome__suggestion"
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                >
                  <span className="ai-welcome__suggestion-bullet">•</span>
                  {s}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px', maxWidth: '500px', lineHeight: '1.5' }}>
              {t('aiAssist.notSure')}
            </p>
          </div>
        ) : (
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ai-msg--${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'ai' && (
                  <div className="ai-msg__label">
                    <span className="ai-msg__label-icon">✦</span>
                    {t('aiAssist.aiGenerated')}
                    <span className="ai-msg__label-info" title="This answer was generated by AI and may not be perfect">ⓘ</span>
                  </div>
                )}
                <div
                  className="ai-msg__bubble"
                  dangerouslySetInnerHTML={
                    msg.role === 'ai'
                      ? { __html: parseMarkdown(msg.text) }
                      : undefined
                  }
                >
                  {msg.role === 'user' ? msg.text : undefined}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-msg__label">
                  <span className="ai-msg__label-icon">✦</span>
                  {t('aiAssist.aiGenerated')}
                </div>
                <div className="ai-typing">
                  <div className="ai-typing__dots">
                    <span className="ai-typing__dot" />
                    <span className="ai-typing__dot" />
                    <span className="ai-typing__dot" />
                  </div>
                  <span className="ai-typing__text">{t('aiAssist.thinking')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="ai-error">
            <span className="ai-error__icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="ai-input-area">
          <div className="ai-input-wrap">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiAssist.askAnything')}
              rows={1}
              disabled={isLoading}
              id="ai-input"
            />
            <button
              className="ai-input__send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              title="Send message"
              id="ai-send-btn"
            >
              ↑
            </button>
          </div>
          <p className="ai-input__disclaimer">
            {t('aiAssist.termsAgree')}{' '}
            <a href="https://stackoverflow.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer">{t('aiAssist.termsOfService')}</a>{' '}
            {t('aiAssist.and')} <a href="https://stackoverflow.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">{t('aiAssist.privacyPolicy')}</a>.
            {t('aiAssist.poweredBy')}
          </p>
        </div>
      </div>

      {/* Right Sidebar Hint */}
      <div className="ai-right-hint">
        <div className="ai-right-hint__card">
          <div className="ai-right-hint__icon">💬</div>
          <p className="ai-right-hint__text">
            {t('aiAssist.needMoreHelp')} <Link to="/ask">{t('aiAssist.askCommunity')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
