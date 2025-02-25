"use client"

import { useState, useEffect } from "react"
import { PersonaSelection } from "./components/PersonaSelection"
import { ChatInterface } from "./components/ChatInterface"
import { Onboarding } from "./components/Onboarding"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Message } from "@/types"

export default function Chat() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [showOnboarding, setShowOnboarding] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem("selectedPersona")
      const savedMessages = localStorage.getItem("messages")
      const savedUserName = localStorage.getItem("userName")
      const hasCompletedOnboarding = localStorage.getItem("onboardingComplete")

      if (savedPersona) setSelectedPersona(savedPersona)
      if (savedMessages) setMessages(JSON.parse(savedMessages))
      if (savedUserName) setUserName(savedUserName)
      if (hasCompletedOnboarding === "true") setShowOnboarding(false)
    } catch (err) {
      console.error("Failed to load session state:", err)
    }
  }, [])

  useEffect(() => {
    try {
      if (selectedPersona) localStorage.setItem("selectedPersona", selectedPersona)
      localStorage.setItem("messages", JSON.stringify(messages))
      if (userName) localStorage.setItem("userName", userName)
    } catch (err) {
      console.error("Failed to save session state:", err)
    }
  }, [selectedPersona, messages, userName])

  const handleSendMessage = async (content: string) => {
    setError(null)
    const newMessage: Message = { role: "user", content, timestamp: Date.now() }
    setMessages((prev) => [...prev, newMessage])
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content, userName }],
          persona: selectedPersona
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "応答の取得に失敗しました")
      }

      // 返答内容にユーザー名を含める場合は、ここで名前に置き換えることもできる
      let responseContent = data.response;
      if (userName) {
        responseContent = responseContent.replace(/あなた/g, userName);
      }

      setMessages((prev) => [...prev, { role: "model", content: responseContent, timestamp: Date.now() }])
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
    // 変更前にメッセージを保存する機能をここで実装できます
    setSelectedPersona(persona)
    
    // ペルソナを変更しても会話履歴は維持する
    // 代わりに、かあちゃんからの「ペルソナ変更」メッセージを追加
    if (messages.length > 0) {
      let welcomeMessage = "";
      if (persona === "caring") {
        welcomeMessage = `${userName ? userName + "、" : ""}こんにちは。優しいかあちゃんになったわよ。どんなことでも話してね。`;
      } else if (persona === "strict") {
        welcomeMessage = `${userName ? userName + "、" : ""}こんにちは。厳しいかあちゃんになったからね。しっかり相談にのるわよ。`;
      } else if (persona === "fun") {
        welcomeMessage = `${userName ? userName + "、" : ""}こんにちは！楽しいかあちゃんになったわよ～♪ 一緒に楽しく話しましょう！`;
      }
      
      if (welcomeMessage) {
        setMessages((prev) => [...prev, { 
          role: "model", 
          content: welcomeMessage, 
          timestamp: Date.now() 
        }]);
      }
    }
    
    setError(null)
  }

  const handleOnboardingComplete = (name: string, persona: string) => {
    setUserName(name);
    setSelectedPersona(persona);
    setShowOnboarding(false);
    localStorage.setItem("onboardingComplete", "true");
    
    // 初回メッセージを追加
    let welcomeMessage = "";
    if (persona === "caring") {
      welcomeMessage = `${name}ちゃん、はじめまして。かあちゃんよ。何かあったらなんでも相談してね。`;
    } else if (persona === "strict") {
      welcomeMessage = `${name}ちゃん、はじめまして。これからお母さんとして色々教えてあげるわね。`;
    } else if (persona === "fun") {
      welcomeMessage = `${name}ちゃん、はじめまして！楽しいかあちゃんよ～♪ なんでも気軽に話してね！`;
    }
    
    if (welcomeMessage) {
      setMessages([{ role: "model", content: welcomeMessage, timestamp: Date.now() }]);
    }
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen">
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster />
      </div>
    )
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
        userName={userName}
      />
      <Toaster />
    </div>
  )
}