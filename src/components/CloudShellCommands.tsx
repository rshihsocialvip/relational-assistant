import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, Upload, Download, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudShellCommandsProps {
  onCopy: (text: string, label: string) => void;
}

const CloudShellCommands: React.FC<CloudShellCommandsProps> = ({ onCopy }) => {
  const commands = {
    setup: {
      title: "Initial Setup",
      commands: [
        "gcloud config set project YOUR_PROJECT_ID",
        "gcloud auth login",
        "git clone YOUR_REPO_URL",
        "cd symmersive-ai-platform"
      ]
    },
    fileOps: {
      title: "File Operations",
      commands: [
        "# Upload files: Use upload button or drag & drop",
        "# Edit files: cloudshell edit filename.tsx",
        "# Download: cloudshell download filename.zip",
        "# Create backup: tar -czf backup.tar.gz src/"
      ]
    },
    deploy: {
      title: "Quick Deploy",
      commands: [
        "chmod +x deploy-cloudshell.sh",
        "./deploy-cloudshell.sh",
        "# Or manual: gcloud run deploy --source ."
      ]
    },
    monitor: {
      title: "Monitoring",
      commands: [
        "gcloud run services list",
        "gcloud run services logs read symmersive-ai-platform",
        "gcloud run services describe symmersive-ai-platform"
      ]
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(commands).map(([key, section]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="h-5 w-5" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.commands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="text-sm flex-1 mr-2">{cmd}</code>
                {!cmd.startsWith('#') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopy(cmd, `${section.title} command`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CloudShellCommands;