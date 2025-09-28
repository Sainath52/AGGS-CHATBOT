import React, { useState, useEffect, useRef } from 'react';
import type { AttachmentFile } from '../App';

// Minimal type definitions for Web Speech API to fix TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// For browsers that use webkit prefix
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
    gapi: any; // Add gapi to the window object for Google Picker API
  }
}

const supportedLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'bn-IN', name: 'বাংলা' },
    { code: 'ta-IN', name: 'தமிழ்' },
    { code: 'te-IN', name: 'తెలుగు' },
    { code: 'mr-IN', name: 'मराठी' },
    { code: 'gu-IN', name: 'ગુજરાતી' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ' },
    { code: 'ml-IN', name: 'മലയാളം' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ' },
    { code: 'ur-IN', name: 'اردو' },
    { code: 'or-IN', name: 'ଓଡିଆ' },
    { code: 'as-IN', name: 'অসমীয়া' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文' },
];

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: AttachmentFile) => void;
  isLoading: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

// Helper to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as a Base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, language, onLanguageChange }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [isPickerReady, setIsPickerReady] = useState(false);
  const [oauthToken, setOauthToken] = useState<string | null>(null);

  // IMPORTANT: These must be configured in your environment for Google Picker to work.
  const GOOGLE_DEVELOPER_KEY = process.env.GOOGLE_DEVELOPER_KEY;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
  
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Effect to initialize Google Picker API
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_DEVELOPER_KEY) {
        console.warn("Google Picker API credentials are not set. Media uploads will be disabled.");
        return;
    }

    const handleGapiLoad = () => {
      window.gapi.load('client:picker', () => {
        window.gapi.client.init({
          apiKey: GOOGLE_DEVELOPER_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).then(() => {
          setIsPickerReady(true);
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (authInstance?.isSignedIn.get()) {
             setOauthToken(authInstance.currentUser.get().getAuthResponse().access_token);
          }
        }).catch((err: any) => {
          console.error("Error initializing GAPI client", err);
        });
      });
    };
    
    if (window.gapi) {
        handleGapiLoad();
    }
  }, [GOOGLE_CLIENT_ID, GOOGLE_DEVELOPER_KEY]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').trim();
      if (transcript) {
        onSendMessage(transcript, attachment ?? undefined);
        setInput(''); 
        setAttachment(null);
      }
    };
    
    recognition.onerror = (event) => {
        if (event.error !== 'no-speech') console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isSpeechRecognitionSupported, onSendMessage, language, attachment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachment) && !isLoading) {
      onSendMessage(input.trim(), attachment ?? undefined);
      setInput('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit(e as any);
    }
  }

  const handleMicClick = () => {
    if (isLoading || !recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  }

  const handlePickerCallback = async (data: any) => {
    if (data.action === window.gapi.picker.Action.PICKED) {
      const doc = data.docs[0];
      try {
        const res = await fetch(doc.url, { headers: { 'Authorization': 'Bearer ' + oauthToken } });
        const blob = await res.blob();
        const base64Data = await blobToBase64(blob);
        setAttachment({
          mimeType: blob.type,
          data: base64Data,
          previewUrl: URL.createObjectURL(blob),
        });
      } catch (error) {
        console.error("Error fetching or converting file:", error);
      }
    }
  }

  const createPicker = (token: string) => {
    const view = new window.gapi.picker.View(window.gapi.picker.ViewId.DOCS_IMAGES);
    view.setMimeTypes("image/png,image/jpeg,image/jpg");
    const picker = new window.gapi.picker.PickerBuilder()
      .enableFeature(window.gapi.picker.Feature.NAV_HIDDEN)
      .setAppId(GOOGLE_CLIENT_ID!.split('-')[0])
      .setOAuthToken(token)
      .addView(view)
      .setDeveloperKey(GOOGLE_DEVELOPER_KEY!)
      .setCallback(handlePickerCallback)
      .build();
    picker.setVisible(true);
  }
  
  const handleAttachmentClick = () => {
    if (!isPickerReady || isLoading) return;
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      authInstance.signIn().then((googleUser: any) => {
        const token = googleUser.getAuthResponse().access_token;
        setOauthToken(token);
        createPicker(token);
      });
    } else {
      createPicker(oauthToken!);
    }
  }
  
  let placeholderText = "Ask an educational question...";
  if(isLoading) placeholderText = "AGGS is thinking...";
  else if (isListening) placeholderText = "Listening...";

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg p-4 border-t border-slate-300/50 dark:border-slate-700/50">
      <div className="max-w-4xl mx-auto">
        {attachment && (
            <div className="mb-2 p-2 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center gap-2">
                    <img src={attachment.previewUrl} alt="Attachment preview" className="w-10 h-10 object-cover rounded" />
                    <span className="text-sm font-medium">Image attached</span>
                </div>
                <button 
                  onClick={() => setAttachment(null)}
                  className="p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500"
                  aria-label="Remove attachment"
                >
                  <span className="font-bold">&times;</span>
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
          <button 
            type="button" 
            onClick={handleAttachmentClick} 
            disabled={isLoading || !isPickerReady} 
            className="flex-shrink-0 px-3 bg-slate-200 dark:bg-slate-700 text-lg font-bold rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
            aria-label="Add media from Google Drive"
          >
            +
          </button>
          
          <select value={language} onChange={(e) => onLanguageChange(e.target.value)} disabled={isLoading} className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center">
            {supportedLanguages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>

          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder={placeholderText} 
            className="flex-1 w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" 
            disabled={isLoading || isListening} 
          />
          
          {isSpeechRecognitionSupported && (
            <button 
              type="button" 
              onClick={handleMicClick} 
              disabled={isLoading} 
              className={`flex-shrink-0 px-3 rounded-md disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`} 
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <span className="text-lg">🎤</span>
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || (!input.trim() && !attachment)} 
            className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-500/50"
            aria-label="Send message"
          >
            <span className="text-lg">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;