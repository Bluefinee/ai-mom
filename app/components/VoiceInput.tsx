import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Add interface definitions for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: 'aborted' | 'audio-capture' | 'bad-grammar' | 'language-not-supported' | 'network' | 'no-speech' | 'not-allowed' | 'service-not-allowed' | 'other';
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

// Augment the Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
    recognition?: SpeechRecognition;
  }
}

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isDisabled?: boolean;
}

export function VoiceInput({ onTranscription, isDisabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // SpeechRecognition APIが使えるか確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupportedBrowser(
        'SpeechRecognition' in window || 
        'webkitSpeechRecognition' in window
      );
    }
  }, []);

  const handleToggleListen = async () => {
    if (isDisabled) return;

    if (!isListening) {
      try {
        // マイクの権限確認
        if (navigator.mediaDevices) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        startListening();
      } catch (err) {
        setPermissionDenied(true);
        console.error('マイクの使用許可が必要です', err);
      }
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    
    // ブラウザ対応
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupportedBrowser(false);
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      onTranscription(transcript);
    };
    
    recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('音声認識エラー:', event.error);
      if (event.error === 'not-allowed') {
        setPermissionDenied(true);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    // Store recognition instance in window for access in stopListening
    window.recognition = recognition;
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
    if (window.recognition) {
      window.recognition.stop();
    }
  };

  if (!isSupportedBrowser) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="text-gray-400"
        title="お使いのブラウザは音声入力に対応していません"
      >
        <MicOff size={20} />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleListen}
        disabled={isDisabled}
        className={`transition-colors ${isListening ? "text-red-500" : "text-gray-500 hover:text-gray-700"}`}
        title={isListening ? "音声入力を停止" : "音声入力を開始"}
      >
        {isListening ? <Mic size={20} className="animate-pulse" /> : <Mic size={20} />}
      </Button>
      
      <AnimatePresence>
        {(isListening || permissionDenied) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 w-48 z-10"
          >
            {permissionDenied ? (
              <div className="flex items-center text-red-500 text-xs">
                <AlertCircle size={14} className="mr-1" />
                マイクの使用を許可してください
              </div>
            ) : (
              <div className="flex items-center text-xs">
                <span className="mr-2">音声入力中...</span>
                <span className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 bg-red-500 rounded-full"
                      animate={{ 
                        height: ["4px", "8px", "4px"],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}