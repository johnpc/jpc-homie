'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new(): SpeechRecognition;
    };
  }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = (): void => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentInput,
          messages: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6)) as {
              type: string;
              content?: string;
              name?: string;
            };

            if (data.type === 'text' && data.content) {
              setMessages((prev) => [...prev, { role: 'assistant', content: data.content as string }]);
            }

            if (data.type === 'tool' && data.name) {
              setMessages((prev) => [...prev, { role: 'tool', content: data.name as string }]);
            }

            if (data.type === 'done') {
              setIsLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const suggestions = [
    "Play songs by Queen",
    "Turn my lights red",
    "Are my heated stairs on?",
    "Open the garage",
    "Set bedroom to 72 degrees",
    "Play Bohemian Rhapsody",
  ];

  const handleSuggestionClick = (suggestion: string): void => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4 px-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">👋 Hi! I'm Homie</h2>
            <p className="text-sm sm:text-base text-gray-500">Try asking me:</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.role === 'tool'
                  ? 'bg-yellow-100 text-yellow-900'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.role === 'tool' ? (
                <span className="text-xs sm:text-sm">🔧 Used tool: {msg.content}</span>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                <span className="text-sm sm:text-base">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 sm:p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to control your smart home..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-xl`}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <button
            onClick={() => void sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
