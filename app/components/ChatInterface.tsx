import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { SendHorizontal, ChevronDown, Smile } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { WelcomeMessage } from "./WelcomeMessage"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { SessionManager } from "@/services/sessiontService"
import { LoadingIndicator } from "./LoadingIndicator"
import { ConversationContext } from "./Conversation"
import { QuickPhrases } from "./QuickPhrases"
import { VoiceInput } from "./VoiceInput"
import { Message } from "@/types"

export interface ConversationSummary {
  keywords: string[];
  topics: string[];
  emotionalContext: string;
  lastTimestamp?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isTyping: boolean;
  error: string | null;
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
  userName: string;
  conversationSummary: ConversationSummary | null;
}

const sessionManager = new SessionManager();

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isTyping, 
  error, 
  selectedPersona, 
  onPersonaChange,
  userName,
  conversationSummary 
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showContextExpanded, setShowContextExpanded] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleVoiceInput = (transcription: string) => {
    setInput(transcription);
    inputRef.current?.focus();
  };

  const handleQuickPhrase = (phrase: string) => {
    setInput(phrase);
    inputRef.current?.focus();
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-white">
      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                なんでもかあちゃん
              </h1>
              {userName && (
                <span className="ml-2 text-gray-500">
                  {userName}さん
                </span>
              )}
            </div>
            <Select value={selectedPersona} onValueChange={handlePersonaChange}>
              <SelectTrigger className={isMobile ? "w-40" : "w-[180px]"}>
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

      {conversationSummary && (
        <ConversationContext
          keywords={conversationSummary.keywords}
          topics={conversationSummary.topics}
          emotionalContext={conversationSummary.emotionalContext}
          timestamp={conversationSummary.lastTimestamp}
          expanded={showContextExpanded}
          onToggleExpand={() => setShowContextExpanded(!showContextExpanded)}
        />
      )}

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
            className="fixed bottom-24 right-4 bg-pink-500 text-white rounded-full p-3 shadow-lg z-10"
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

      <motion.div 
        className="border-t bg-white/80 backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-start gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg flex items-center pr-2 focus-within:ring-2 focus-within:ring-pink-300 focus-within:bg-white">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${getPersonaLabel()}にメッセージを送る...`}
                className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0"
                maxLength={500}
                disabled={isTyping}
              />
              
              <div className="flex items-center space-x-1">
                <QuickPhrases 
                  persona={selectedPersona} 
                  onSelectPhrase={handleQuickPhrase} 
                />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isTyping}
                >
                  <Smile size={20} />
                </Button>
                
                <VoiceInput 
                  onTranscription={handleVoiceInput} 
                  isDisabled={isTyping} 
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSendClick}
              disabled={!validateInput(input) || isTyping}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
              size="icon"
            >
              <SendHorizontal size={18} />
            </Button>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <div className="flex space-x-2">
              <span>{input.length}/500</span>
            </div>
            <div>
              {isTyping && <span>かあちゃん、返信中...</span>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}