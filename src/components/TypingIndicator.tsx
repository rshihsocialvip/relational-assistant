import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start message-animate">
      <div className="max-w-[85%] flex flex-col">
        <div className="bg-muted rounded-lg px-4 py-3 chat-message">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">AI is typing</span>
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