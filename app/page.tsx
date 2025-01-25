"use client"

import { useState, useEffect } from "react"
import { PersonaSelection } from "./components/PersonaSelection"
import { ChatInterface } from "./components/ChatInterface"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "model"
  content: string
}

export default function Chat() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem("selectedPersona")
      const savedMessages = localStorage.getItem("messages")

      if (savedPersona) setSelectedPersona(savedPersona)
      if (savedMessages) setMessages(JSON.parse(savedMessages))
    } catch (err) {
      console.error("Failed to load session state:", err)
    }
  }, [])

  useEffect(() => {
    try {
      if (selectedPersona) localStorage.setItem("selectedPersona", selectedPersona)
      localStorage.setItem("messages", JSON.stringify(messages))
    } catch (err) {
      console.error("Failed to save session state:", err)
    }
  }, [selectedPersona, messages])

  const handleSendMessage = async (content: string) => {
    setError(null)
    const newMessage: Message = { role: "user", content }
    setMessages((prev) => [...prev, newMessage])
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(-10),
          persona: selectedPersona,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "応答の取得に失敗しました")
      }

      setMessages((prev) => [...prev, { role: "model", content: data.response }])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "エラーが発生しました"
      console.error("Failed to get response:", error)
      setError(errorMessage)
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona)
    setMessages([])
    setError(null)
  }

  if (!selectedPersona) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-100 via-green-100 to-blue-100">
        <PersonaSelection onSelect={handlePersonaChange} />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-green-100 to-blue-100">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        error={error}
        selectedPersona={selectedPersona}
        onPersonaChange={handlePersonaChange}
      />
      <Toaster />
    </div>
  )
}