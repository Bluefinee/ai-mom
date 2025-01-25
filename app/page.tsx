"use client"

import { useState, useEffect } from "react"
import { PersonaSelection } from "./components/PersonaSelection"
import { ChatInterface } from "./components/ChatInterface"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function Chat() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load previous session state if available
    const savedPersona = localStorage.getItem("selectedPersona")
    const savedMessages = localStorage.getItem("messages")

    if (savedPersona) setSelectedPersona(savedPersona)
    if (savedMessages) setMessages(JSON.parse(savedMessages))
  }, [])

  useEffect(() => {
    // Save session state
    if (selectedPersona) localStorage.setItem("selectedPersona", selectedPersona)
    localStorage.setItem("messages", JSON.stringify(messages))
  }, [selectedPersona, messages])

  const handleSendMessage = async (content: string) => {
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

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Failed to get response", error)
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona)
    setMessages([]) // Clear messages when changing persona
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-green-100 to-blue-100">
      {!selectedPersona ? (
        <PersonaSelection onSelect={handlePersonaChange} />
      ) : (
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          selectedPersona={selectedPersona}
          onPersonaChange={handlePersonaChange}
        />
      )}
      <Toaster />
    </div>
  )
}

interface Message {
  role: "user" | "assistant"
  content: string
}

