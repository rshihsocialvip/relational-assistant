import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Cost effective' }
];

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useAppContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">AI Model</Label>
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col">
                <span>{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;