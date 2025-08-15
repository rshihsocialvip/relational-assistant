import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageCircle, Clock } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import ShareSessionDialog from '@/components/ShareSessionDialog';


const SessionManager: React.FC = () => {
  const { sessions, activeSessionId, createSession, selectSession } = useAppContext();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Sessions
          </CardTitle>
          <Button onClick={createSession} size="sm" className="h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No sessions yet</p>
                <p className="text-xs mt-1">Create your first session to start chatting</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                    activeSessionId === session.id
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => selectSession(session.id)}
                    >
                      <h4 className="font-medium text-sm truncate">{session.name}</h4>
                      {session.last_message && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {session.last_message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {session.message_count}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(session.updated_at)}
                        </div>
                      </div>
                      <ShareSessionDialog 
                        sessionId={session.id} 
                        sessionName={session.name} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SessionManager;