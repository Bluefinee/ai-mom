import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertCircle, X, Check } from "lucide-react";
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
  }
}

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isDisabled?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  language?: string;
  placeholder?: string;
}

export function VoiceInput({ 
  onTranscription, 
  isDisabled = false, 
  isOpen, 
  setIsOpen,
  language = 'ja-JP',
  placeholder = "音声を認識しています..."
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use ref instead of window property
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // SpeechRecognition APIが使えるか確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupportedBrowser(
        'SpeechRecognition' in window || 
        'webkitSpeechRecognition' in window
      );
    }
  }, []);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
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
        setIsOpen(true);
        setErrorMessage(null);
      } catch (err) {
        setPermissionDenied(true);
        setIsOpen(true);
        setErrorMessage("マイクの使用許可が必要です");
        console.error('マイクの使用許可が必要です', err);
      }
    } else {
      stopListening();
    }
  };

  const handleSuccessfulTranscription = (text: string) => {
    onTranscription(text);
    setShowSuccess(true);
    
    // 成功表示を一定時間後に消す
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setShowSuccess(false);
    
    // ブラウザ対応
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupportedBrowser(false);
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      
      setTranscript(transcript);
      
      if (result.isFinal) {
        handleSuccessfulTranscription(transcript);
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('音声認識エラー:', event.error);
      
      // エラーメッセージを設定
      switch(event.error) {
        case 'not-allowed':
          setPermissionDenied(true);
          setErrorMessage("マイクの使用許可が必要です");
          break;
        case 'audio-capture':
          setErrorMessage("マイクが見つかりません");
          break;
        case 'no-speech':
          setErrorMessage("音声が検出されませんでした");
          break;
        case 'network':
          setErrorMessage("ネットワークエラーが発生しました");
          break;
        default:
          setErrorMessage(`エラーが発生しました: ${event.error}`);
      }
      
      setIsListening(false);
    };
    
    recognition.onend = () => {
      // 正常終了の場合はエラーメッセージを表示しない
      if (isListening && !errorMessage) {
        // ユーザーが明示的に停止していない場合は再開を試みる
        try {
          recognition.start();
          return;
        } catch (e) {
          console.error("音声認識の再開に失敗しました", e);
        }
      }
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.error("音声認識の開始に失敗しました", e);
      setErrorMessage("音声認識の開始に失敗しました");
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsOpen(false);
  };

  // コンポーネント外部からの isOpen の変更に対応
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
    }
  }, [isOpen]);

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
        className={`transition-colors ${isListening 
          ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
          : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
        title={isListening ? "音声入力を停止" : "音声入力を開始"}
      >
        {isListening ? <Mic size={20} className="animate-pulse" /> : <Mic size={20} />}
      </Button>
      
      <AnimatePresence>
        {(isOpen) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 w-64 z-20 border border-indigo-100"
            style={{ 
              transformOrigin: "bottom right",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            {permissionDenied ? (
              <div className="flex items-center text-red-500 text-xs p-2">
                <AlertCircle size={14} className="mr-1" />
                <span>マイクの使用を許可してください</span>
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-700">音声入力</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                
                {isListening ? (
                  <div>
                    <div className="flex justify-center py-2">
                      <div className="flex space-x-2 items-center">
                        {[...Array(3)].map((_, i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 bg-red-500 rounded-full"
                            animate={{ 
                              height: ["8px", "16px", "8px"],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="text-xs mt-2 text-gray-600 max-h-20 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-100">
                        {transcript || placeholder}
                      </div>
                      
                      {/* 送信成功表示 */}
                      <AnimatePresence>
                        {showSuccess && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded"
                          >
                            <div className="flex items-center text-green-500">
                              <Check size={16} className="mr-1" />
                              <span className="text-xs font-medium">送信完了</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* エラーメッセージ表示 */}
                    {errorMessage && (
                      <div className="mt-2 text-xs text-red-500 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-center mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                        onClick={stopListening}
                      >
                        録音停止
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-600 mb-2">「マイク」ボタンをクリックして録音を開始</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      onClick={handleToggleListen}
                    >
                      録音開始
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}