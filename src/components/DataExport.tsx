import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  sessions: any[];
  userMemory: any;
  totalMessages: number;
}

interface DataExportProps {
  data: ExportData;
}

const DataExport: React.FC<DataExportProps> = ({ data }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [exportScope, setExportScope] = useState('all');
  const { toast } = useToast();

  const handleExport = () => {
    try {
      let exportData: any = {};
      
      if (exportScope === 'all' || exportScope === 'sessions') {
        exportData.sessions = data?.sessions || [];
      }
      
      if (exportScope === 'all' || exportScope === 'memory') {
        exportData.userMemory = data?.userMemory || {};
      }
      
      exportData.exportedAt = new Date().toISOString();
      exportData.totalMessages = data?.totalMessages || 0;

      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `ai-data-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format for sessions
        const csvRows = ['Timestamp,Session ID,User Input,AI Response'];
        const sessions = data?.sessions || [];
        sessions.forEach(session => {
          const messages = session?.messages || [];
          messages.forEach((msg: any) => {
            if (msg?.type === 'user') {
              const nextMsg = messages.find((m: any) => 
                m?.timestamp > msg?.timestamp && m?.type === 'assistant'
              );
              csvRows.push(`"${msg?.timestamp || ''}","${session?.id || ''}","${msg?.content || ''}","${nextMsg?.content || ''}"`);  
            }
          });
        });
        content = csvRows.join('\n');
        filename = `ai-data-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Data exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    }
  };

  const sessionsCount = data?.sessions?.length || 0;
  const totalMessages = data?.totalMessages || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <Database className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{sessionsCount}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <FileText className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalMessages}</div>
            <div className="text-sm text-muted-foreground">Messages</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Complete Data)</SelectItem>
                <SelectItem value="csv">CSV (Messages Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Export Scope</label>
            <Select value={exportScope} onValueChange={setExportScope}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="sessions">Sessions Only</SelectItem>
                <SelectItem value="memory">User Memory Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            Portable
          </Badge>
          <Badge variant="outline">Privacy-First</Badge>
          <Badge variant="outline">No Cloud Lock-in</Badge>
        </div>

        <Button onClick={handleExport} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataExport;