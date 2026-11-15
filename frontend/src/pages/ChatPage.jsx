import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/chat';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(text);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Something went wrong. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-page-title">
          <h1 className="chat-title">Calendar Assistant</h1>
          <h4>Email : shahidfirozaba@gmail.com</h4>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <p key={index} className={`chat-message ${msg.role}`}>
              <span className="sender">
                {msg.role === 'user' ? 'You' : 'Bot'}:
              </span>
              {msg.text}
            </p>
          ))}
          {loading && <p className="chat-typing">Bot is typing...</p>}
          <div ref={bottomRef} />
          <div style={{ height: '400px', overflowY: 'auto' }}></div>
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about your schedule..."
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;