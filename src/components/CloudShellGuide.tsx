import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Terminal, Cloud, FileText, Play, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CloudShellCommands from './CloudShellCommands';

const CloudShellGuide: React.FC = () => {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const quickCommands = [
    "git clone <your-repo-url> && cd <project-folder>",
    "npm install",
    "chmod +x deploy-cloudshell.sh && ./deploy-cloudshell.sh"
  ];

  const downloadScript = () => {
    const scriptContent = `#!/bin/bash\n\n# Download this script and run in Cloud Shell\n# curl -O https://your-domain.com/deploy-cloudshell.sh\n# chmod +x deploy-cloudshell.sh\n# ./deploy-cloudshell.sh\n\necho "🚀 Starting Cloud Shell deployment..."`;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-cloudshell.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Cloud className="h-8 w-8 text-blue-500" />
          Google Cloud Shell Deployment
        </h1>
        <p className="text-muted-foreground">
          Deploy your AI platform directly from Google Cloud Shell with pre-configured tools
        </p>
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          Google Cloud Shell provides a free, browser-based terminal with gcloud CLI, Node.js, and Git pre-installed.
          Perfect for quick deployments and file management without local setup.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="filemanagement">Files</TabsTrigger>
          <TabsTrigger value="troubleshooting">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                3-Step Deployment
              </CardTitle>
              <CardDescription>
                Deploy in under 5 minutes using our Cloud Shell optimized script
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {quickCommands.map((cmd, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <code className="text-sm">{cmd}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(cmd, `Step ${idx + 1}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={downloadScript} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Deploy Script
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://shell.cloud.google.com', '_blank')}
                  className="flex-1"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Open Cloud Shell
                </Button>
              </div>
              
              <Badge variant="secondary" className="w-full justify-center py-2">
                ✅ Typical deployment time: 3-5 minutes
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <CloudShellCommands onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="filemanagement" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cloud Shell File Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📤 Upload Files
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the three-dot menu → Upload files, or drag & drop directly
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      # For large files, use Cloud Storage:<br/>
                      gsutil cp local-file.zip gs://your-bucket/
                    </code>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ✏️ Edit Files
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the built-in code editor or command-line editors
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      cloudshell edit src/App.tsx<br/>
                      # Or: nano filename.tsx<br/>
                      # Or: vim filename.tsx
                    </code>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📥 Download Files
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Download files or create archives for backup
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      cloudshell download filename.zip<br/>
                      # Create archive: tar -czf backup.tar.gz src/
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <h4 className="font-semibold mb-2">❓ Project Not Set</h4>
                  <p className="text-sm mb-2">Error: "No Google Cloud project set"</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    gcloud config set project YOUR_PROJECT_ID
                  </code>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-semibold mb-2">🔐 Authentication Issues</h4>
                  <p className="text-sm mb-2">If deployment fails with auth errors</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    gcloud auth login<br/>
                    gcloud auth application-default login
                  </code>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-semibold mb-2">🚀 Deployment Stuck</h4>
                  <p className="text-sm mb-2">If Cloud Run deployment hangs</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    # Cancel and retry:<br/>
                    Ctrl+C<br/>
                    gcloud run deploy --source . --platform managed
                  </code>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <h4 className="font-semibold mb-2">📊 View Logs</h4>
                  <p className="text-sm mb-2">Debug deployment or runtime issues</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    gcloud run services logs read symmersive-ai-platform --region us-central1 --follow
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudShellGuide;