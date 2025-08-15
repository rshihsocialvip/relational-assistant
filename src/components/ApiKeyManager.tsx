import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key, AlertTriangle, CheckCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  onApiKeyChange: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
      setIsValid(true);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim() && validateKeyFormat(apiKey.trim())) {
      localStorage.setItem('openai-api-key', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setIsValid(true);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey('');
    onApiKeyChange('');
    setIsValid(null);
  };

  const validateKeyFormat = (key: string) => {
    return key.startsWith('sk-') && key.length > 20;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            API key is required to use the chat functionality. Get your key from{' '}
            <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
              OpenAI Platform
            </a>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveKey} 
            disabled={!validateKeyFormat(apiKey)}
            className="flex-1"
          >
            Save API Key
          </Button>
          
          {isValid && (
            <Button 
              onClick={handleClearKey} 
              variant="outline"
            >
              Clear
            </Button>
          )}
        </div>

        {isValid === true && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              API key is saved and ready to use.
            </AlertDescription>
          </Alert>
        )}
        
        {apiKey && !validateKeyFormat(apiKey) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Invalid API key format. Keys should start with 'sk-' and be at least 20 characters long.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your API key is stored locally in your browser and never sent to our servers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;