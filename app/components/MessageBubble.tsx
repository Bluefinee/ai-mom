import { useState } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { motion } from "framer-motion"
import { MessageFeedback } from "./MessageFeedback"

interface MessageBubbleProps {
  message: {
    role: "user" | "model"
    content: string
    timestamp: number
  }
  persona?: "caring" | "strict" | "fun"
  isMobile?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
}

export function MessageBubble({ 
  message, 
  persona = "caring",
  isMobile = false,
  isFirstInGroup = true,
  isLastInGroup = true 
}: MessageBubbleProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const isUser = message.role === "user"
  const maxWidth = isMobile ? "w-3/4" : "max-w-2xl"
  const timestamp = Number.isInteger(message.timestamp) 
    ? new Date(message.timestamp).toLocaleString('ja-JP')
    : new Date().toLocaleString('ja-JP')

  // ペルソナごとのスタイル設定
  const getBubbleStyle = () => {
    if (isUser) return "bg-pink-100";
    
    switch(persona) {
      case "caring":
        return "bg-pink-100 border-pink-200 border";
      case "strict":
        return "bg-blue-100 border-blue-200 border";
      case "fun":
        return "bg-yellow-100 border-yellow-200 border";
      default:
        return "bg-blue-100";
    }
  };

  const getAvatarImage = () => {
    if (isUser) return "https://github.com/shadcn.png";
    
    switch(persona) {
      case "caring":
        return "/images/japanese-mom.jpg";
      case "strict":
        return "/images/japanese-mom.jpg";
      case "fun":
        return "/images/japanese-mom.jpg";
      default:
        return "/images/japanese-mom.jpg";
    }
  };

  const handleFeedback = (messageId: number, helpful: boolean) => {
    console.log(`Message ${messageId} feedback: ${helpful ? 'helpful' : 'unhelpful'}`);
    // ここでフィードバックをサーバーに送信するロジックを追加
  };

  const handleSave = (messageId: number) => {
    console.log(`Message ${messageId} saved to favorites`);
    // ここでお気に入り保存ロジックを追加
  };

  return (
    <div 
      className={cn(
        "flex items-start space-x-2", 
        isUser ? "flex-row-reverse space-x-reverse" : "flex-row",
        !isLastInGroup ? "mb-1" : "mb-4"
      )}
      onMouseEnter={() => !isUser && setShowFeedback(true)}
      onMouseLeave={() => !isUser && setShowFeedback(false)}
    >
      {isFirstInGroup && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className={cn(
            "w-8 h-8 mt-1", 
            isUser ? "bg-pink-500" : persona === "caring" ? "bg-pink-200" : persona === "strict" ? "bg-blue-200" : "bg-yellow-200"
          )}>
            <AvatarImage 
              src={getAvatarImage()} 
              alt={isUser ? "User Avatar" : `${persona} Mom Avatar`}
            />
          </Avatar>
        </motion.div>
      )}
      
      <div className="flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            maxWidth,
            "px-6 py-4 rounded-lg",
            getBubbleStyle(),
            isUser ? "text-right" : "text-left",
            {
              'rounded-t-lg rounded-b-md': !isLastInGroup,
              'rounded-t-md rounded-b-lg': !isFirstInGroup && isLastInGroup,
              'rounded-md': !isFirstInGroup && !isLastInGroup,
            }
          )}
        >
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              ul: ({children}) => <ul className="space-y-2 my-4">{children}</ul>,
              li: ({children}) => (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{children}</span>
                </li>
              ),
              p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>
            }}
          >
            {message.content}
          </ReactMarkdown>
        </motion.div>
        <div className="flex justify-between items-center">
          <span className={cn(
            "text-xs text-gray-400 mt-1",
            isUser ? "text-right" : "text-left"
          )}>
            {timestamp}
          </span>
          
          {!isUser && (showFeedback || isMobile) && (
            <MessageFeedback 
              messageId={message.timestamp} 
              onFeedback={handleFeedback} 
              onSave={handleSave} 
            />
          )}
        </div>
      </div>
    </div>
  )
}