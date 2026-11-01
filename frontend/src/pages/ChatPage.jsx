import { useState } from 'react';
import { sendChatMessage } from '../api/chat';

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
    <div>
      <h1>Calendar Assistant</h1>

      <div>
        {messages.map((msg, index) => (
          <p key={index} style={{ whiteSpace: 'pre-wrap' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </p>
        ))}
        {loading && <p>Bot is typing...</p>}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="Ask about your schedule..."
      />
      <button onClick={handleSend} disabled={loading}>
        Send
      </button>
    </div>
  );
}

export default ChatPage;    