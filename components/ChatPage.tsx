
import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import Header from '../components/Header';
import { getWikipediaSummary } from '../services/wikipediaService';
import type { Message } from '../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    text: 'Welcome! Ask any question about the education sector and I will provide information from Wikipedia.',
    sender: 'aggs',
    lang: 'en-US',
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      lang: language,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const wikiRes = await getWikipediaSummary(text, language);
      const aggsMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: wikiRes.text + (wikiRes.url ? `\n\nSource: ${wikiRes.url}` : ''),
        sender: 'aggs',
        lang: language,
      };
      setMessages((prev) => [...prev, aggsMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, there was an error fetching information.',
        sender: 'aggs',
        lang: language,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-center justify-center my-4 animate-fade-in-up">
              <div className="p-4 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} language={language} onLanguageChange={setLanguage} />
    </div>
  );
};

export default ChatPage;
