import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const cleanTextForSpeech = (text: string) => {
      return text.trim();
  };

  const handleToggleSpeech = () => {
    if (!isSpeechSynthesisSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToSpeak = cleanTextForSpeech(message.text);
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = message.lang || 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  return (
    <div className={`flex items-start gap-3 my-4 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-lg text-white shadow-md">
            A
        </div>
      )}
      <div
        className={`max-w-xl rounded-lg shadow-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
        }`}
      >
        <div className="p-4">
            {isUser && message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="User upload"
                className="w-full h-auto object-cover rounded-lg mb-2"
              />
            )}
             {!isUser && message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="A visual representation related to the educational topic" 
                className="w-full h-auto object-cover rounded-lg mb-2 bg-slate-700" 
              />
            )}
            <p className="whitespace-pre-wrap text-center leading-relaxed">{message.text}</p>
            
            {!isUser && message.searchResults && message.searchResults.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                <h3 className="text-sm font-semibold mb-2 text-center">Sources</h3>
                <div className="flex flex-col items-center space-y-2">
                  {message.searchResults.map((result, index) => (
                    <a
                      href={result.uri}
                      key={`search-link-${message.id}-${index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm text-center"
                    >
                      🔗 {result.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!isUser && isSpeechSynthesisSupported && message.text && (
                <div className="flex justify-center mt-3 border-t border-slate-300 dark:border-slate-600 pt-2">
                    <button 
                        onClick={handleToggleSpeech}
                        className="p-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label={isSpeaking ? "Stop speech" : "Read aloud"}
                    >
                        {isSpeaking 
                            ? <span className="text-lg">⏹️</span>
                            : <span className="text-lg">🔊</span>
                        }
                    </button>
                </div>
            )}
        </div>
      </div>
      {isUser && (
         <div className="w-10 h-10 rounded-full bg-slate-500 flex-shrink-0 flex items-center justify-center font-bold text-lg text-white shadow-md">
            U
        </div>
      )}
    </div>
  );
};

export default ChatMessage;