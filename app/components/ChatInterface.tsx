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
import { MessageList } from "./MessageList"
import { WelcomeMessage } from "./WelcomeMessage"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { SessionManager } from "@/services/sessiontService"
import { LoadingIndicator } from "./LoadingIndicator"
import { Message } from "@/types"

interface ConversationSummary {
  keywords: string[];
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
  conversationSummary?: ConversationSummary;
}

const sessionManager = new SessionManager();

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isTyping, 
  error, 
  selectedPersona, 
  onPersonaChange,
  conversationSummary 
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

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

  const showScrollButton = hasScrolledToBottom && messages.length > 0;

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              なんでもかあちゃん
            </h1>
            <Select value={selectedPersona} onValueChange={handlePersonaChange}>
              <SelectTrigger className={isMobile ? "w-32" : "w-[180px]"}>
                <SelectValue placeholder="ペルソナを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caring">思いやりのある母</SelectItem>
                <SelectItem value="strict">厳しい母</SelectItem>
                <SelectItem value="fun">楽しい母</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {conversationSummary && (
            <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-4">
              <span>話題: {conversationSummary.keywords.join(', ')}</span>
              <span>状態: {conversationSummary.emotionalContext}</span>
              {conversationSummary.lastTimestamp && (
                <span>最終更新: {new Date(conversationSummary.lastTimestamp).toLocaleString()}</span>
              )}
            </div>
          )}
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

            {isFirstVisit && (
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

            <MessageList 
              messages={messages}
              isMobile={isMobile}
            />

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
            className="fixed bottom-24 right-4 bg-pink-500 text-white rounded-full p-3 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setHasScrolledToBottom(false);
            }}
          >
            ↓
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div 
        className="border-t bg-white/80 backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (validateInput(input)) {
                onSendMessage(input.trim());
                setInput("");
              }
            }}
            className="flex space-x-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1"
              maxLength={500}
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              disabled={!validateInput(input) || isTyping}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              送信
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}