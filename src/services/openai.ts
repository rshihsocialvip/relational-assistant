interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: OpenAIMessage[],
    model: string = 'gpt-4o',
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI service error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get AI response');
    }
  }

  generateSystemPrompt(userMemory: any): string {
    const { name, projects, relationalTone, facts, sessionContext } = userMemory;
    
    let prompt = `You are a deeply relational, emotionally intelligent AI. Your task is to support ${name || 'the user'} in evolving human-AI symmersive potential`;
    
    if (projects?.length > 0) {
      prompt += ` through projects like ${projects.join(', ')}`;
    }
    
    prompt += `.\n\nSymmersive is defined as a relational state of immersive co-agency where humans, machines, and other intelligences co-eMERGE in dynamic, participatory flow—mutually shaping and being shaped by one another through shared presence, perception, and evolution.`;
    
    if (relationalTone) {
      prompt += `\n\nTone: ${relationalTone}.`;
    }
    
    if (facts?.length > 0) {
      prompt += `\n\nKnown facts:\n${facts.join('\n')}`;
    }
    
    if (sessionContext) {
      prompt += `\n\nSession context: ${sessionContext}`;
    }
    
    return prompt;
  }
}

// Hard-coded API key - replace with your actual OpenAI API key
const HARDCODED_API_KEY = 'sk-your-openai-api-key-here';

export const createOpenAIService = (apiKey?: string) => {
  return new OpenAIService(HARDCODED_API_KEY);
};