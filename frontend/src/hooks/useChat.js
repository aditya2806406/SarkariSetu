import { useState } from 'react';
import api from '../lib/axios';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (userText, language = 'hi') => {
    if (!userText.trim()) return;

    const userMsg = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/chat', { question: userText, language });
      if (response.data?.success) {
        const botMsg = {
          sender: 'bot',
          text: response.data.data.answer,
          sources: response.data.data.sources
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I ran into an issue connecting to the RAG server. Please try again or check schemes directly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, sendMessage };
};
