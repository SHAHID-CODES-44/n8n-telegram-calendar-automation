import { useState } from 'react';
import { sendChatMessage } from '../api/chat';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      <h1 className="chat-title">Calendar Assistant</h1>

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