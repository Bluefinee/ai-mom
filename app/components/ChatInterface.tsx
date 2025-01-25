import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageBubble } from "./MessageBubble"
import { WelcomeMessage } from "./WelcomeMessage"

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping: boolean
  selectedPersona: string
  onPersonaChange: (persona: string) => void
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  selectedPersona,
  onPersonaChange,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFirstMessage, setIsFirstMessage] = useState(true)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setIsFirstMessage(true)
  }, [selectedPersona]) // Updated dependency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
      setIsFirstMessage(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-500">AI母ちゃん</h1>
        <Select value={selectedPersona} onValueChange={onPersonaChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ペルソナを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="caring">思いやりのある母</SelectItem>
            <SelectItem value="strict">厳しい母</SelectItem>
            <SelectItem value="fun">楽しい母</SelectItem>
          </SelectContent>
        </Select>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isFirstMessage && (
          <WelcomeMessage
            persona={selectedPersona}
            onExampleSelect={(example) => {
              setInput(example)
              setIsFirstMessage(false)
            }}
          />
        )}
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2">
            <Avatar />
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white shadow-sm">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <Button type="submit">送信</Button>
        </div>
      </form>
    </div>
  )
}

interface Message {
  role: "user" | "assistant"
  content: string
}

