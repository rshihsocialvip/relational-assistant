import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Bot } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import VoiceInput from './VoiceInput';
import { supabase } from '@/lib/supabase';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, selectedModel, activeSessionId, setMessages, regenerateMessage } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && sendMessage && activeSessionId) {
      await sendMessage(input.trim());
      setInput('');
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  const getModelDisplayName = (model: string) => {
    const modelNames: { [key: string]: string } = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo'
    };
    return modelNames[model] || model || 'Unknown Model';
  };

  const handleReaction = async (messageId: string, reaction: 'positive' | 'negative') => {
    try {
      // Send feedback to backend
      const feedbackMessage = reaction === 'positive' ? 'This is a good response' : 'This is a bad response';
      
      // You could store this feedback in the database or send to analytics
      console.log(`Feedback for message ${messageId}: ${feedbackMessage}`);
      
      // Optionally, you could call a Supabase function to log feedback
      // await supabase.functions.invoke('log-feedback', {
      //   body: { messageId, reaction, feedback: feedbackMessage }
      // });
      
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // Update message in database
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      if (setMessages) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, content: newContent } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleRegenerate = async (type: 'try-again' | 'add-detail' | 'more-concise') => {
    if (regenerateMessage) {
      await regenerateMessage(type);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Interface
            {!activeSessionId && (
              <span className="text-sm text-muted-foreground font-normal">
                (No active session)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <Badge variant="secondary" className="text-xs">
              {getModelDisplayName(selectedModel)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-6 chat-scroll-area"
          style={{ height: 'calc(100vh - 300px)' }}
        >
          <div className="space-y-4 pb-4 min-h-full">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {activeSessionId ? (
                  <div>
                    <p>Start a conversation to see messages here</p>
                     <p className="text-xs mt-2">Try commands like:</p>
                     <p className="text-xs">!remember [fact] - Save a fact</p>
                     <p className="text-xs">!context [info] - Set session context</p>
                     <p className="text-xs mt-2">💡 Use the microphone button for voice input</p>
                  </div>
                ) : (
                  <p>Creating session...</p>
                )}
              </div>
            ) : (
              messages.map((message, index) => {
                const isLastAssistantMessage = 
                  message.type === 'assistant' && 
                  index === messages.length - 1;
                
                return (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    index={index}
                    isLastAssistantMessage={isLastAssistantMessage}
                    onReaction={handleReaction}
                    onEdit={handleEditMessage}
                    onRegenerate={handleRegenerate}
                  />
                );
              })
            )}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </ScrollArea>
        <div className="border-t p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !activeSessionId 
                  ? "Creating session..." 
                  : "Type your message..."
              }
              disabled={isLoading || !activeSessionId}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              disabled={isLoading || !activeSessionId}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || !activeSessionId}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;