import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const APP_NAME = 'data-ai-manage';

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  // Clear any existing silence timeout
  const clearSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
      console.log(`[${APP_NAME}] Silence timeout cleared`);
    }
  };

  // Set up auto-stop after silence
  const startSilenceTimeout = () => {
    clearSilenceTimeout();
    silenceTimeoutRef.current = setTimeout(() => {
      console.log(`[${APP_NAME}] Auto-stopping due to silence`);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        toast({
          title: "Recording stopped",
          description: "Auto-stopped after silence",
          duration: 2000,
        });
      }
    }, 2000); // 2 seconds of silence
    console.log(`[${APP_NAME}] Silence timeout started (2s)`);
  };

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      setPermissionStatus('denied');
      setError('Microphone access denied');
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access in your browser settings",
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  };

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    console.log(`[${APP_NAME}] Speech Recognition API check:`, {
      SpeechRecognition: !!SpeechRecognition,
      webkitSpeechRecognition: !!window.webkitSpeechRecognition,
      windowSpeechRecognition: !!window.SpeechRecognition
    });
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Configure recognition
      // Configure recognition
      recognition.continuous = true;  // Keep listening for multiple words
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log(`[${APP_NAME}] Speech recognition configured:`, {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });

      recognition.onstart = () => {
        console.log(`[${APP_NAME}] Speech recognition started`);
        setIsListening(true);
        setError(null);
        toast({
          title: "Listening...",
          description: "Speak now",
          duration: 2000,
        });
      };

      recognition.onend = () => {
        console.log(`[${APP_NAME}] Speech recognition ended`);
        setIsListening(false);
        clearSilenceTimeout(); // Clear timeout when recognition ends
      };

      recognition.onspeechstart = () => {
        console.log(`[${APP_NAME}] Speech detected`);
        clearSilenceTimeout(); // Clear timeout when speech starts
        toast({
          title: "Speech detected",
          description: "Processing...",
          duration: 1000,
        });
      };

      recognition.onspeechend = () => {
        console.log(`[${APP_NAME}] Speech ended - starting silence timeout`);
        startSilenceTimeout(); // Start timeout when speech ends
      };
      recognition.onresult = (event) => {
        try {
          console.log(`[${APP_NAME}] === SPEECH RECOGNITION RESULT ===`);
          
          // Don't log the entire event object - it causes DataCloneError
          console.log(`[${APP_NAME}] Results length:`, event.results?.length || 0);
          console.log(`[${APP_NAME}] Result index:`, event.resultIndex);
          
          if (!event.results || event.results.length === 0) {
            console.log(`[${APP_NAME}] No results in event`);
            return;
          }

          // Build complete transcript from all results
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result && result.length > 0) {
              const transcript = result[0].transcript;
              if (result.isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
          }

          const fullTranscript = finalTranscript + interimTranscript;
          
          console.log(`[${APP_NAME}] Final transcript:`, finalTranscript);
          console.log(`[${APP_NAME}] Interim transcript:`, interimTranscript);
          console.log(`[${APP_NAME}] Full transcript:`, fullTranscript);

          // Only send final results to avoid duplicates
          if (finalTranscript && finalTranscript.trim()) {
            console.log(`[${APP_NAME}] Sending final transcript:`, finalTranscript.trim());
            onTranscript(finalTranscript.trim());
            toast({
              title: "Voice captured!",
              description: `"${finalTranscript.trim()}"`,
              duration: 3000,
            });
          }
        } catch (error) {
          console.log(`[${APP_NAME}] ERROR in onresult handler:`, error.message);
        }
      };

      recognition.onerror = (event) => {
        console.log(`[${APP_NAME}] Speech recognition error:`, event.error);
        
        setIsListening(false);
        let errorMessage = '';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Try speaking louder.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Check your microphone connection.';
            break;
          case 'network':
            errorMessage = 'Network error. Check your internet connection.';
            break;
          case 'aborted':
            console.log(`[${APP_NAME}] Recognition aborted (manual stop)`);
            return;
          default:
            errorMessage = `Voice input failed: ${event.error}`;
        }
        
        setError(errorMessage);
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
          duration: 4000,
        });
      };
    } else {
      console.log(`[${APP_NAME}] Speech Recognition not supported`);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, toast]);

  const toggleListening = async () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      clearSilenceTimeout(); // Clear timeout when manually stopping
      recognitionRef.current.stop();
    } else {
      // Check microphone permission first
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;

      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        const errorMsg = 'Failed to start voice input. Try refreshing the page.';
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled
          title="Voice input not supported in this browser"
          className="flex-shrink-0"
        >
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
        <span className="text-xs text-muted-foreground mt-1 text-center max-w-20">
          Not supported
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant={error ? "destructive" : isListening ? "default" : "outline"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          "flex-shrink-0",
          isListening && "animate-pulse bg-red-500 hover:bg-red-600",
          error && "bg-red-500 hover:bg-red-600"
        )}
        title={error || (isListening ? "Stop recording" : "Start voice input")}
      >
        {error ? (
          <AlertCircle className="h-4 w-4" />
        ) : isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {error && (
        <span className="text-xs text-red-500 mt-1 text-center max-w-32">
          {error}
        </span>
      )}
      {permissionStatus === 'denied' && (
        <span className="text-xs text-orange-500 mt-1 text-center max-w-32">
          Check browser settings
        </span>
      )}
    </div>
  );
};

export default VoiceInput;