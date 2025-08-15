import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Plus, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import ApiKeyManager from './ApiKeyManager';
import { useAppContext } from '@/contexts/AppContext';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { setApiKey } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    tone: 'professional',
    projects: [] as string[],
    facts: [] as string[],
    context: ''
  });
  const [newProject, setNewProject] = useState('');
  const [newFact, setNewFact] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        location: profile.location || '',
        tone: profile.tone || 'professional',
        projects: profile.projects || [],
        facts: profile.facts || [],
        context: profile.context || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
  };

  const addProject = () => {
    if (newProject.trim() && !formData.projects.includes(newProject.trim())) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject.trim()]
      }));
      setNewProject('');
    }
  };

  const removeProject = (project: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p !== project)
    }));
  };

  const addFact = () => {
    if (newFact.trim() && !formData.facts.includes(newFact.trim())) {
      setFormData(prev => ({
        ...prev,
        facts: [...prev.facts, newFact.trim()]
      }));
      setNewFact('');
    }
  };

  const removeFact = (fact: string) => {
    setFormData(prev => ({
      ...prev,
      facts: prev.facts.filter(f => f !== fact)
    }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApiKeyManager onApiKeyChange={setApiKey} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Your location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Communication Tone</Label>
            <Input
              id="tone"
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              placeholder="professional, casual, friendly"
            />
          </div>

          <div className="space-y-2">
            <Label>Projects</Label>
            <div className="flex gap-2">
              <Input
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="Add a project"
                onKeyPress={(e) => e.key === 'Enter' && addProject()}
              />
              <Button onClick={addProject} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.projects.map((project, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {project}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeProject(project)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Facts to Remember</Label>
            <div className="flex gap-2">
              <Input
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="Add a fact to remember"
                onKeyPress={(e) => e.key === 'Enter' && addFact()}
              />
              <Button onClick={addFact} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {formData.facts.map((fact, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                  <span>{fact}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFact(fact)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Session Context</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              placeholder="Current session context or focus"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;