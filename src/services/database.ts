import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  user_id: string;
  name: string;
  last_message?: string;
  message_count: number;
  created_at: Date;
  updated_at: Date;
}

export class DatabaseService {
  // Session management
  static async createSession(name: string): Promise<Session | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return null;
      }
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating session:', error);
        throw error;
      }
      
      console.log('Session created successfully:', data);
      return {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        last_message: data.last_message,
        message_count: data.message_count || 0,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  static async getSessions(): Promise<Session[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }
      
      // Get user's own sessions
      const { data: ownSessions, error: ownError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (ownError) {
        console.error('Supabase error fetching own sessions:', ownError);
        throw ownError;
      }

      // Get shared sessions
      const { data: sharedSessions, error: sharedError } = await supabase
        .from('shared_sessions')
        .select(`
          shared_session_id,
          sessions!shared_sessions_shared_session_id_fkey(*)
        `)
        .eq('shared_with_user_id', user.id)
        .eq('is_active', true);

      if (sharedError) {
        console.error('Supabase error fetching shared sessions:', sharedError);
        // Don't throw, just log and continue with own sessions
      }

      const allSessions = [...(ownSessions || [])];
      
      // Add shared sessions
      if (sharedSessions) {
        sharedSessions.forEach(shared => {
          if (shared.sessions) {
            allSessions.push({
              ...shared.sessions,
              name: `Shared: ${shared.sessions.name}`
            });
          }
        });
      }

      // Sort by updated_at
      allSessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      console.log('Sessions fetched successfully:', allSessions.length);
      return allSessions.map(session => ({
        id: session.id,
        user_id: session.user_id,
        name: session.name,
        last_message: session.last_message,
        message_count: session.message_count || 0,
        created_at: new Date(session.created_at),
        updated_at: new Date(session.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  // Message management
  static async saveMessage(sessionId: string, type: 'user' | 'assistant', content: string): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return null;
      }
      
      console.log('Saving message:', { sessionId, type, content: content.substring(0, 50) + '...' });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          type,
          content
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error saving message:', error);
        throw error;
      }
      
      console.log('Message saved successfully:', data.id);
      
      // Update session after saving message
      await this.updateSession(sessionId, content);
      
      return {
        id: data.id,
        session_id: data.session_id,
        user_id: data.user_id,
        type: data.type,
        content: data.content,
        timestamp: new Date(data.timestamp || data.created_at)
      };
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  static async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }
      
      console.log('Fetching messages for session:', sessionId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching messages:', error);
        throw error;
      }
      
      console.log('Messages fetched successfully:', data?.length || 0);
      return (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        user_id: msg.user_id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.timestamp || msg.created_at)
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  private static async updateSession(sessionId: string, lastMessage: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const messageCount = await this.getMessageCount(sessionId);
      
      const { error } = await supabase
        .from('sessions')
        .update({
          last_message: lastMessage,
          message_count: messageCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating session:', error);
        throw error;
      }
      
      console.log('Session updated successfully');
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  private static async getMessageCount(sessionId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Supabase error deleting message:', error);
        throw error;
      }
      
      console.log('Message deleted successfully:', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}