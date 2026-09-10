import { useState } from 'react';
import { GROQ_API_KEY, GROQ_API_URL, MODELS } from './config';
import { getSystemPrompt } from './systemPrompt';
import './Madly.css';

// المسار المباشر لصورة مادلي من مجلد public
const madlyImg = "/images/robot sign.png";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MadlyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Madly, your AI engineering mentor. How can I help you today?' }
  ]);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [savedList, setSavedList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'saved' | 'settings'>('chat');

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // إضافة السؤال لقائمة الـ History
    setHistoryList(prev => [text, ...prev]);

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const userLang = /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
      const systemPromptText = getSystemPrompt(userLang);

      const apiMessages = [
        { role: 'system', content: systemPromptText },
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODELS.text || "llama-3.1-8b-instant",
          messages: apiMessages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content || "";

      const finalReply = replyText || (userLang === 'ar' ? "عذراً، لم أحصل على رد." : "Sorry, I didn't get a response.");
      setMessages(prev => [...prev, { role: 'assistant', content: finalReply }]);
    } catch (err: any) {
      console.error("Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: `خطأ: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMessage = (content: string) => {
    if (!savedList.includes(content)) {
      setSavedList(prev => [content, ...prev]);
    }
  };

  return (
    <div className="madly-root">
      {!isOpen ? (
        <button className="madly-floating-btn" onClick={() => setIsOpen(true)}>
          <img src={madlyImg} alt="Madly AI" className="madly-avatar-img" />
        </button>
      ) : (
        <div className="madly-chat-window">
          {/* Sidebar */}
          <div className="madly-sidebar">
            <div className="madly-brand">
              <div className="madly-avatar">
                <img src={madlyImg} alt="Madly AI" className="madly-avatar-img" />
              </div>
              <div className="madly-brand-info">
                <h3>Madly AI</h3>
                <span>Engineering Mentor</span>
              </div>
            </div>

            <div className="madly-nav-links">
              <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
                💬 New Chat
              </button>
              <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                ⏱️ History ({historyList.length})
              </button>
              <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
                🔖 Saved ({savedList.length})
              </button>
              <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                ⚙️ Settings
              </button>
            </div>

            <div className="madly-quick-actions-section">
              <h4>Quick Actions</h4>
              <button onClick={() => { setActiveTab('chat'); handleSend("Explain IoT network topologies"); }}>⚡ Explain IoT</button>
              <button onClick={() => { setActiveTab('chat'); handleSend("Help me with Assembly 8086 lab code"); }}>💻 Assembly Lab</button>
              <button onClick={() => { setActiveTab('chat'); handleSend("Explain Ohm's Law and KVL"); }}>🔌 Circuits Help</button>
            </div>

            <div className="madly-sidebar-footer">
              <button className="madly-upgrade-btn">🚀 Virtual Hub</button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="madly-main-content">
            <div className="madly-chat-header">
              <div className="madly-chat-title">
                <div className="madly-bot-avatar">
                  <img src={madlyImg} alt="Madly AI" className="madly-avatar-img" />
                </div>
                <span>{activeTab === 'chat' ? 'Active Chat' : activeTab.toUpperCase() + ' SECTION'}</span>
              </div>
              <div className="madly-status">
                <span className="madly-pulse-dot"></span>
                <span>Online</span>
                <button className="madly-close-btn" onClick={() => setIsOpen(false)}>✕</button>
              </div>
            </div>

            {/* Dynamic Views based on Active Tab */}
            {activeTab === 'chat' && (
              <>
                <div className="madly-chat-body">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`madly-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      <div className="madly-msg-avatar">
                        {msg.role === 'user' ? '👤' : <img src={madlyImg} alt="Madly AI" className="madly-avatar-img" />}
                      </div>
                      <div className="madly-bubble" style={{ position: 'relative' }}>
                        {msg.content}
                        {msg.role === 'assistant' && (
                          <button 
                            onClick={() => handleSaveMessage(msg.content)} 
                            style={{ position: 'absolute', bottom: '5px', left: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ff69b4' }}
                            title="Save message"
                          >
                            🔖 Save
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="madly-msg ai">
                      <div className="madly-msg-avatar">
                        <img src={madlyImg} alt="Madly AI" className="madly-avatar-img" />
                      </div>
                      <div className="madly-bubble">
                        <div className="madly-typing-dots">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="madly-chat-input-area">
                  <div className="madly-input-row">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Ask Madly anything about IoT, Assembly, Circuits..."
                      disabled={loading}
                    />
                    <button className="madly-send-btn" onClick={() => handleSend()} disabled={loading}>
                      ➤
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'history' && (
              <div className="madly-chat-body" style={{ overflowY: 'auto' }}>
                <h4 style={{ color: '#ff69b4', margin: '0 0 10px 0' }}>Chat History</h4>
                {historyList.length === 0 ? (
                  <p style={{ color: '#d6c6ff', fontSize: '13px' }}>No history yet. Start asking questions!</p>
                ) : (
                  historyList.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', border: '1px solid rgba(204,153,255,0.1)' }}>
                      💬 {item}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="madly-chat-body" style={{ overflowY: 'auto' }}>
                <h4 style={{ color: '#ff69b4', margin: '0 0 10px 0' }}>Saved Messages</h4>
                {savedList.length === 0 ? (
                  <p style={{ color: '#d6c6ff', fontSize: '13px' }}>No saved messages yet. Click 'Save' on any AI response.</p>
                ) : (
                  savedList.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', border: '1px solid rgba(204,153,255,0.1)' }}>
                      🔖 {item}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="madly-chat-body" style={{ overflowY: 'auto' }}>
                <h4 style={{ color: '#ff69b4', margin: '0 0 10px 0' }}>Widget Settings</h4>
                <p style={{ color: '#d6c6ff', fontSize: '13px' }}>Model: Llama 3.1 8B Instant (Groq)</p>
                <p style={{ color: '#d6c6ff', fontSize: '13px' }}>Language Mode: Auto (Arabic / English)</p>
                <button 
                  onClick={() => { setMessages([{ role: 'assistant', content: 'Chat reset. How can I help you?' }]); setHistoryList([]); }} 
                  style={{ background: 'rgba(233, 30, 140, 0.2)', border: '1px solid #ff69b4', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
                >
                  Clear Chat & History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}