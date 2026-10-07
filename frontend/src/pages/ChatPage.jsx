import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { useChat } from '../hooks/useChat';

export const ChatPage = () => {
  const { messages, loading, sendMessage } = useChat();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          BharatSahaayak <span className="text-orange-400">RAG AI Chat</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Ask questions in your preferred language about any central or state government scheme. Get answers verified against official department documents.
        </p>
      </div>

      <ChatInterface messages={messages} onSendMessage={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatPage;
