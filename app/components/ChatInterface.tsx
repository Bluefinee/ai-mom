import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageBubble } from "./MessageBubble"
import { WelcomeMessage } from "./WelcomeMessage"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping: boolean
  error: string | null
  selectedPersona: string
  onPersonaChange: (persona: string) => void
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  error,
  selectedPersona,
  onPersonaChange,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isInputValid, setIsInputValid] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    setIsFirstMessage(true)
  }, [selectedPersona])

  const validateInput = (value: string) => {
    const trimmed = value.trim()
    setIsInputValid(trimmed.length > 0 && trimmed.length <= 500)
    return trimmed.length > 0 && trimmed.length <= 500
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateInput(input)) {
      onSendMessage(input.trim())
      setInput("")
      setIsFirstMessage(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-pink-500">AI母ちゃん</h1>
        <Select value={selectedPersona} onValueChange={onPersonaChange}>
          <SelectTrigger className={isMobile ? "w-32" : "w-[180px]"}>
            <SelectValue placeholder="ペルソナを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="caring">思いやりのある母</SelectItem>
            <SelectItem value="strict">厳しい母</SelectItem>
            <SelectItem value="fun">楽しい母</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isFirstMessage && (
          <WelcomeMessage
            persona={selectedPersona}
            onExampleSelect={(example) => {
              setInput(example)
              setIsInputValid(true)
              setIsFirstMessage(false)
            }}
          />
        )}

        {messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message} 
            isMobile={isMobile}
          />
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 animate-pulse">
            <Avatar className="w-8 h-8 bg-gray-200" />
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <span>...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="p-4 bg-white shadow-lg border-t"
      >
        <div className="flex flex-col space-y-2">
          {!isInputValid && (
            <span className="text-red-500 text-sm">
              メッセージは1-500文字で入力してください
            </span>
          )}
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                validateInput(e.target.value)
              }}
              placeholder="メッセージを入力..."
              className="flex-1"
              maxLength={500}
            />
            <Button 
              type="submit" 
              disabled={!isInputValid || isTyping}
            >
              送信
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

interface Message {
  role: "user" | "model"
  content: string
}