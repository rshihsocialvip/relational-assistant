import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, User, History, Download, Sparkles, Settings, Cloud, Terminal, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import UserProfile from './UserProfile';
import SessionManager from './SessionManager';
import DataExport from './DataExport';
import ModelSelector from './ModelSelector';

const AppLayout: React.FC = () => {
  const { getExportData } = useAppContext();
  const { signOut, user } = useAuth();
  
  const exportData = getExportData ? getExportData() : { sessions: [], userMemory: {}, totalMessages: 0 };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Symmersive AI Platform
            </h1>
            <div className="ml-4 flex gap-2">
              <Link to="/deploy" className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors">
                <Cloud className="h-4 w-4" />
                Deploy
              </Link>
              <Link to="/cloud-shell" className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg text-sm font-medium transition-colors">
                <Terminal className="h-4 w-4" />
                Cloud Shell
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Take ownership of your AI conversations. Preserve context, build memory, and maintain continuity across different AI models.
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground mt-2">
              Signed in as: {user.email}
            </p>
          )}
        </div>

        <Tabs defaultValue="chat" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <TabsContent value="chat" className="p-6 m-0">
              <div className="h-[600px]">
                <ChatInterface />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="p-6 m-0">
              <div className="max-w-2xl mx-auto">
                <UserProfile />
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="p-6 m-0">
              <SessionManager />
            </TabsContent>

            <TabsContent value="settings" className="p-6 m-0">
              <div className="max-w-2xl mx-auto space-y-6">
                <ModelSelector />
              </div>
            </TabsContent>

            <TabsContent value="export" className="p-6 m-0">
              <div className="max-w-2xl mx-auto">
                <DataExport data={exportData} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AppLayout;