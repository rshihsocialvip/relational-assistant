import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Cloud, Terminal, Rocket, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeploymentGuide: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Command copied successfully",
    });
  };

  const deploymentSteps = [
    { id: 1, title: "Install Google Cloud CLI", completed: false },
    { id: 2, title: "Authenticate with Google Cloud", completed: false },
    { id: 3, title: "Set up project", completed: false },
    { id: 4, title: "Deploy application", completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Rocket className="h-8 w-8" />
          Deploy to Google Cloud
        </h1>
        <p className="text-muted-foreground">
          Deploy your AI platform to Google Cloud with just a few commands
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Your application is ready for deployment! All configuration files are in place.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Quick Deploy</TabsTrigger>
          <TabsTrigger value="manual">Manual Steps</TabsTrigger>
          <TabsTrigger value="ci-cd">CI/CD Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                One-Click Deployment
              </CardTitle>
              <CardDescription>
                Use the automated deployment script for fastest setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span># Make script executable and deploy</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('chmod +x deploy.sh && ./deploy.sh')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div>chmod +x deploy.sh</div>
                <div>./deploy.sh</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Cloud className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Cloud Run</h3>
                  <p className="text-sm text-muted-foreground">Serverless deployment</p>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Terminal className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Auto-scaling</h3>
                  <p className="text-sm text-muted-foreground">0-10 instances</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Production Ready</h3>
                  <p className="text-sm text-muted-foreground">HTTPS & CDN included</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid gap-4">
            {deploymentSteps.map((step) => (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.id}
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {step.id === 1 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Install the Google Cloud CLI:</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                        <span>curl https://sdk.cloud.google.com | bash</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard('curl https://sdk.cloud.google.com | bash')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {step.id === 2 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Authenticate with your Google Cloud account:</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                        <span>gcloud auth login</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gcloud auth login')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {step.id === 3 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Set your Google Cloud project:</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                        <span>gcloud config set project YOUR_PROJECT_ID</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gcloud config set project YOUR_PROJECT_ID')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {step.id === 4 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Deploy to Cloud Run:</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                        <span>gcloud run deploy --source . --platform managed</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gcloud run deploy --source . --platform managed')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ci-cd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Deployment</CardTitle>
              <CardDescription>
                Set up automated deployments with Google Cloud Build
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your project includes a <code className="bg-muted px-1 rounded">cloudbuild.yaml</code> file for automated deployments.
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span># Connect your repository to Cloud Build</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('gcloud builds submit --config cloudbuild.yaml')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div>gcloud builds submit --config cloudbuild.yaml</div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Once connected, every push to your main branch will automatically deploy to Cloud Run.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentGuide;