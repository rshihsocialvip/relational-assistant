import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOpenAIService, OpenAIService } from '@/services/openai';
import { DatabaseService, Message, Session } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface AppContextType {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  selectedModel: string;
  isLoading: boolean;
  regenerateType: string | null;
  createSession: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  regenerateMessage: (type: 'try-again' | 'add-detail' | 'more-concise') => Promise<void>;
  setSelectedModel: (model: string) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  getExportData: () => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [regenerateType, setRegenerateType] = useState<string | null>(null);
  const [openaiService, setOpenaiService] = useState<OpenAIService | null>(null);

  useEffect(() => {
    // Initialize OpenAI service with hard-coded API key
    setOpenaiService(createOpenAIService());
  }, []);

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const dbSessions = await DatabaseService.getSessions();
      setSessions(dbSessions);

      const savedModel = localStorage.getItem('ai-selected-model');
      if (savedModel) {
        setSelectedModelState(savedModel);
      }

      const savedActiveSession = localStorage.getItem(`ai-active-session-${user?.id}`);
      if (savedActiveSession && dbSessions.find(s => s.id === savedActiveSession)) {
        setActiveSessionId(savedActiveSession);
        const sessionMessages = await DatabaseService.getMessages(savedActiveSession);
        setMessages(sessionMessages);
      } else if (dbSessions.length === 0) {
        await createSession();
      } else if (dbSessions.length > 0) {
        const mostRecent = dbSessions[0];
        setActiveSessionId(mostRecent.id);
        const sessionMessages = await DatabaseService.getMessages(mostRecent.id);
        setMessages(sessionMessages);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  useEffect(() => {
    if (activeSessionId && user?.id) {
      localStorage.setItem(`ai-active-session-${user.id}`, activeSessionId);
    }
  }, [activeSessionId, user?.id]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('ai-selected-model', selectedModel);
    }
  }, [selectedModel]);

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
  };

  const createSession = async () => {
    try {
      const sessionName = `Session ${sessions.length + 1}`;
      const newSession = await DatabaseService.createSession(sessionName);
      if (newSession) {
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      const sessionMessages = await DatabaseService.getMessages(sessionId);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error selecting session:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeSessionId) {
      console.error('No active session');
      return;
    }

    if (!openaiService) {
      console.error('OpenAI service not initialized');
      return;
    }

    setIsLoading(true);
    
    try {
      const userMessage = await DatabaseService.saveMessage(activeSessionId, 'user', content);
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
        
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, last_message: content, message_count: session.message_count + 1 }
            : session
        ));
      } else {
        throw new Error('Failed to save user message');
      }

      const userMemory = {
        name: profile?.name || '',
        location: profile?.location || '',
        projects: profile?.projects || [],
        relationalTone: profile?.tone || 'professional',
        facts: profile?.facts || [],
        sessionContext: profile?.context || ''
      };
      
      const systemPrompt = openaiService.generateSystemPrompt(userMemory);
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content }
      ];
      
      const aiResponseContent = await openaiService.sendMessage(apiMessages, selectedModel);
      
      const aiMessage = await DatabaseService.saveMessage(activeSessionId, 'assistant', aiResponseContent);
      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
        
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, message_count: session.message_count + 1 }
            : session
        ));
      } else {
        throw new Error('Failed to save AI response');
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorContent = `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`;
      const errorMessage = await DatabaseService.saveMessage(activeSessionId, 'assistant', errorContent);
      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMessage = async (type: 'try-again' | 'add-detail' | 'more-concise') => {
    if (!activeSessionId || !openaiService) return;
    
    // Find the last user message
    const lastUserMessage = messages.filter(msg => msg.type === 'user').pop();
    if (!lastUserMessage) return;

    // Set regenerate type for contextual typing indicator
    setRegenerateType(type);
    setIsLoading(true);
    
    try {
      // Remove the last assistant message from database and local state
      const lastAssistantMessage = messages.filter(msg => msg.type === 'assistant').pop();
      if (lastAssistantMessage) {
        await DatabaseService.deleteMessage(lastAssistantMessage.id);
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== lastAssistantMessage.id)
        );
      }

      // Create modified prompt based on regeneration type (only for API, not stored)
      let modifiedPrompt = lastUserMessage.content;
      
      switch (type) {
        case 'try-again':
          modifiedPrompt = `${lastUserMessage.content}\n\n(Please provide an alternative response to this request)`;
          break;
        case 'add-detail':
          modifiedPrompt = `${lastUserMessage.content}\n\n(Please provide a more detailed and comprehensive response)`;
          break;
        case 'more-concise':
          modifiedPrompt = `${lastUserMessage.content}\n\n(Please provide a more concise and succinct response)`;
          break;
      }

      // Generate new response using modified prompt but don't save the modified prompt
      const userMemory = {
        name: profile?.name || '',
        location: profile?.location || '',
        projects: profile?.projects || [],
        relationalTone: profile?.tone || 'professional',
        facts: profile?.facts || [],
        sessionContext: profile?.context || ''
      };
      
      const systemPrompt = openaiService.generateSystemPrompt(userMemory);
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: modifiedPrompt }
      ];
      
      const aiResponseContent = await openaiService.sendMessage(apiMessages, selectedModel);
      
      // Save the new AI response
      const aiMessage = await DatabaseService.saveMessage(activeSessionId, 'assistant', aiResponseContent);
      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to save AI response');
      }
    } catch (error) {
      console.error('Error in regenerateMessage:', error);
      const errorContent = `Error: ${error instanceof Error ? error.message : 'Failed to regenerate response'}`;
      const errorMessage = await DatabaseService.saveMessage(activeSessionId, 'assistant', errorContent);
      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setRegenerateType(null);
    }
  };

  const getExportData = () => {
    const totalMessages = sessions.reduce((sum, session) => sum + session.message_count, 0);
    return {
      userId: user?.id,
      userEmail: user?.email,
      profile,
      sessions,
      totalMessages
    };
  };

  const contextValue: AppContextType = {
    sessions,
    activeSessionId,
    messages,
    selectedModel,
    isLoading,
    regenerateType,
    createSession,
    selectSession,
    sendMessage,
    regenerateMessage,
    setSelectedModel,
    setMessages,
    getExportData
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};