import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ShareSessionDialogProps {
  sessionId: string;
  sessionName: string;
}

const ShareSessionDialog: React.FC<ShareSessionDialogProps> = ({ sessionId, sessionName }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-session', {
        body: { 
          sessionId, 
          recipientEmail: email.trim() 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Session Shared",
        description: `Successfully shared "${sessionName}" with ${email}`,
      });

      setEmail('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error sharing session:', error);
      toast({
        title: "Sharing Failed",
        description: error.message || "Failed to share session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="session-name">Session</Label>
            <Input
              id="session-name"
              value={sessionName}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleShare()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareSessionDialog;