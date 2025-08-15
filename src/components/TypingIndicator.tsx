import React from 'react';
import { Bot } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const TypingIndicator: React.FC = () => {
  const { regenerateType } = useAppContext();

  const getTypingMessage = () => {
    if (regenerateType) {
      switch (regenerateType) {
        case 'try-again':
          return 'Trying again...';
        case 'add-detail':
          return 'Adding detail...';
        case 'more-concise':
          return 'Being more concise...';
        default:
          return 'AI is typing';
      }
    }
    return 'AI is typing';
  };

  return (
    <div className="flex justify-start message-animate">
      <div className="max-w-[85%] flex flex-col">
        <div className="bg-muted rounded-lg px-4 py-3 chat-message">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{getTypingMessage()}</span>
              <div className="flex gap-1 ml-2">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 px-2 justify-start">
          <Bot className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Now</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;