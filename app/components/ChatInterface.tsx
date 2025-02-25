import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { SendHorizontal, ChevronDown } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { WelcomeMessage } from "./WelcomeMessage"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { SessionManager } from "@/services/sessiontService"
import { LoadingIndicator } from "./LoadingIndicator"
import { QuickPhrases } from "./QuickPhrases"
import { VoiceInput } from "./VoiceInput"
import { Message } from "@/types"

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isTyping: boolean;
  error: string | null;
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
  userName: string;
}

const sessionManager = new SessionManager();

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isTyping, 
  error, 
  selectedPersona, 
  onPersonaChange,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [quickPhrasesOpen, setQuickPhrasesOpen] = useState(false)
  const [voiceInputOpen, setVoiceInputOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const quickPhrasesRef = useRef<HTMLDivElement>(null)
  const voiceInputRef = useRef<HTMLDivElement>(null)

  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const initializeUserSession = () => {
      sessionManager.initializeSession();
      const currentSession = sessionManager.getCurrentSession();
      
      if (currentSession) {
        setIsFirstVisit(false);
      }
    };

    initializeUserSession();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && !hasScrolledToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, hasScrolledToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setHasScrolledToBottom(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // クリックイベントの処理を追加
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // QuickPhrases外のクリックを処理
      if (
        quickPhrasesOpen && 
        quickPhrasesRef.current && 
        !quickPhrasesRef.current.contains(event.target as Node)
      ) {
        setQuickPhrasesOpen(false);
      }

      // VoiceInput外のクリックを処理
      if (
        voiceInputOpen && 
        voiceInputRef.current && 
        !voiceInputRef.current.contains(event.target as Node)
      ) {
        setVoiceInputOpen(false);
      }
    };

    // Escキーの処理を追加
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuickPhrasesOpen(false);
        setVoiceInputOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [quickPhrasesOpen, voiceInputOpen]);

  const handlePersonaChange = (persona: string) => {
    onPersonaChange(persona);
    setIsFirstVisit(true);
  };

  const validateInput = (value: string): boolean => {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= 500;
  };

  const handleSendClick = () => {
    if (validateInput(input)) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME入力中はイベントを処理しない
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    
    // Enterキーと同時にShiftキーが押されていない場合のみ送信処理を行う
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleVoiceInput = (transcription: string) => {
    setInput(transcription);
    inputRef.current?.focus();
    setVoiceInputOpen(false);
  };

  const handleQuickPhrase = (phrase: string) => {
    setInput(phrase);
    inputRef.current?.focus();
    setQuickPhrasesOpen(false);
  };

  const showScrollButton = hasScrolledToBottom && messages.length > 0;

  const getPersonaEmoji = () => {
    switch(selectedPersona) {
      case "caring": return "💗";
      case "strict": return "📝";
      case "fun": return "🎉";
      default: return "💭";
    }
  };

  const getPersonaLabel = () => {
    switch(selectedPersona) {
      case "caring": return "思いやりのある母";
      case "strict": return "厳しい母";
      case "fun": return "楽しい母";
      default: return "かあちゃん";
    }
  };

  const groupMessages = (msgs: Message[]) => {
    return msgs.reduce((groups: Message[][], message) => {
      const lastGroup = groups[groups.length - 1];
      
      // 5分以内のメッセージであれば同じグループにする
      const isWithinTimeThreshold = lastGroup && 
        message.timestamp - lastGroup[lastGroup.length - 1].timestamp < 5 * 60 * 1000;
      
      if (lastGroup && lastGroup[0].role === message.role && isWithinTimeThreshold) {
        lastGroup.push(message);
      } else {
        groups.push([message]);
      }
      
      return groups;
    }, []);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-indigo-50 to-white">
      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-10 border-b border-indigo-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                おふくろAI
              </h1>
              {/* ユーザー名の表示を削除 */}
            </div>
            <Select value={selectedPersona} onValueChange={handlePersonaChange}>
              <SelectTrigger className={`${isMobile ? "w-40" : "w-[180px]"} border-indigo-200 focus:ring-indigo-300 focus:border-indigo-300 focus:ring-opacity-50`}>
                <div className="flex items-center">
                  <span className="mr-2">{getPersonaEmoji()}</span>
                  <SelectValue placeholder="ペルソナを選択" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caring" className="flex items-center">
                  <span className="mr-2">💗</span>思いやりのある母
                </SelectItem>
                <SelectItem value="strict" className="flex items-center">
                  <span className="mr-2">📝</span>厳しい母
                </SelectItem>
                <SelectItem value="fun" className="flex items-center">
                  <span className="mr-2">🎉</span>楽しい母
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.header>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {isFirstVisit && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <WelcomeMessage
                  persona={selectedPersona}
                  onExampleSelect={(example) => {
                    setInput(example);
                    setIsFirstVisit(false);
                    inputRef.current?.focus();
                  }}
                  onSendMessage={onSendMessage}
                />
              </motion.div>
            )}

            {groupMessages(messages).map((group, groupIndex) => (
              <motion.div
                key={`group-${groupIndex}-${group[0].timestamp}`}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.95 },
                }}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-1"
              >
                {group.map((message, messageIndex) => (
                  <MessageBubble
                    key={`${groupIndex}-${messageIndex}-${message.timestamp}`}
                    message={message}
                    persona={selectedPersona as "caring" | "strict" | "fun"}
                    isMobile={isMobile}
                    isFirstInGroup={messageIndex === 0}
                    isLastInGroup={messageIndex === group.length - 1}
                  />
                ))}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <LoadingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            className="fixed bottom-24 right-4 bg-indigo-500 text-white rounded-full p-3 shadow-lg z-10 hover:bg-indigo-600 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setHasScrolledToBottom(false);
            }}
          >
            <ChevronDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 改善されたチャット入力欄 */}
      <motion.div 
        className="border-t border-indigo-100 bg-white/90 backdrop-blur-sm py-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 bg-gray-50 rounded-2xl flex items-center p-2 pl-4 pr-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:ring-opacity-50 focus-within:bg-white border border-indigo-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${getPersonaLabel()}にメッセージを送る...`}
                  className="flex-1 bg-transparent border-none shadow-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 resize-none min-h-12 max-h-32 py-2 text-base"
                  style={{ outline: 'none' }}
                  maxLength={500}
                  disabled={isTyping}
                  rows={Math.min(3, Math.max(1, input.split('\n').length))}
                />
                
                <div className="flex items-center space-x-2 ml-2">
                  <div ref={quickPhrasesRef}>
                    <QuickPhrases 
                      persona={selectedPersona}
                      onSelectPhrase={handleQuickPhrase}
                      isOpen={quickPhrasesOpen}
                      setIsOpen={setQuickPhrasesOpen}
                    />
                  </div>
                  
                  <div ref={voiceInputRef}>
                    <VoiceInput 
                      onTranscription={handleVoiceInput}
                      isDisabled={isTyping}
                      isOpen={voiceInputOpen}
                      setIsOpen={setVoiceInputOpen}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSendClick}
                disabled={!validateInput(input) || isTyping}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                size="icon"
              >
                <SendHorizontal size={20} />
              </Button>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <div className="flex space-x-2">
                <span className={input.length > 400 ? (input.length > 450 ? "text-red-500" : "text-amber-600") : "text-indigo-400"}>
                  {input.length}/500
                </span>
              </div>
              <div>
                {isTyping && <span className="text-indigo-500">かあちゃん、返信中...</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}