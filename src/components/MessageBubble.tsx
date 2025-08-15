import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, User, Bot, ThumbsUp, ThumbsDown, Edit2, X, Save, Volume2, RotateCcw, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  isLastAssistantMessage?: boolean;
  onReaction?: (messageId: string, reaction: 'positive' | 'negative') => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (type: 'try-again' | 'add-detail' | 'more-concise') => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  index, 
  isLastAssistantMessage = false,
  onReaction, 
  onEdit,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [reacted, setReacted] = useState<'positive' | 'negative' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        description: "Message copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy message",
        duration: 2000,
      });
    }
  };

  const handleReaction = (reaction: 'positive' | 'negative') => {
    if (onReaction) {
      onReaction(message.id, reaction);
      setReacted(reaction);
      toast({
        description: `Feedback sent: ${reaction === 'positive' ? 'Good response' : 'Bad response'}`,
        duration: 2000,
      });
    }
  };

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
      toast({
        description: "Message updated",
        duration: 2000,
      });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      // Stop current speech
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({
        variant: "destructive",
        description: "Text-to-speech is not supported in this browser",
        duration: 3000,
      });
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(message.content);
      
      // Set speech parameters
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          variant: "destructive",
          description: "Failed to read message",
          duration: 2000,
        });
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to read message",
        duration: 2000,
      });
    }
  };

  const handleRegenerate = (type: 'try-again' | 'add-detail' | 'more-concise') => {
    if (onRegenerate) {
      onRegenerate(type);
      toast({
        description: `Regenerating response: ${type.replace('-', ' ')}`,
        duration: 2000,
      });
    }
  };
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const isError = message.content.startsWith('Error:');

  return (
    <div
      className={`flex message-animate group ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="max-w-[85%] flex flex-col">
        <div
          className={`rounded-lg px-4 py-3 chat-message ${
            message.type === 'user'
              ? 'bg-primary text-primary-foreground'
              : isError
              ? 'bg-destructive/10 border border-destructive/20'
              : 'bg-muted'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === 'Escape') {
                    cancelEdit();
                  }
                }}
              />
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleEdit} className="h-6 px-2">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 px-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          )}
        </div>
        
        {/* Action buttons below message */}
        {!isEditing && (
          <div className="flex gap-1 mt-2 px-2">
            {/* Copy and Edit buttons for all messages */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            
            {message.type === 'user' && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            
            {/* Text-to-speech and reactions for assistant messages */}
            {message.type === 'assistant' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 ${isSpeaking ? 'bg-blue-100 text-blue-700' : ''}`}
                  onClick={handleTextToSpeech}
                  title={isSpeaking ? 'Stop reading' : 'Read message aloud'}
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
                
                {onReaction && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 ${reacted === 'positive' ? 'bg-green-100 text-green-700' : ''}`}
                      onClick={() => handleReaction('positive')}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 ${reacted === 'negative' ? 'bg-red-100 text-red-700' : ''}`}
                      onClick={() => handleReaction('negative')}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                   </>
                 )}
                 
                 {/* Regenerate button for last assistant message */}
                 {isLastAssistantMessage && onRegenerate && (
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 px-2"
                         title="Regenerate response"
                       >
                         <RotateCcw className="h-3 w-3" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="w-40">
                       <DropdownMenuItem onClick={() => handleRegenerate('try-again')}>
                         Try Again
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleRegenerate('add-detail')}>
                         Add Detail
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleRegenerate('more-concise')}>
                         More Concise
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 )}
               </>
              )}
          </div>
        )}
        
        {/* Timestamp and avatar */}
        <div className={`flex items-center gap-2 mt-1 px-2 ${
          message.type === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          {message.type === 'assistant' && <Bot className="h-3 w-3 text-muted-foreground" />}
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.type === 'user' && <User className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;