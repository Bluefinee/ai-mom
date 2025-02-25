import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { motion } from "framer-motion"

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
  const isUser = message.role === "user"
  const maxWidth = isMobile ? "w-3/4" : "max-w-2xl"
  const timestamp = Number.isInteger(message.timestamp) 
    ? new Date(message.timestamp).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  // ペルソナごとのスタイル設定
  const getBubbleStyle = () => {
    if (isUser) return "bg-indigo-100 text-indigo-900";
    
    switch(persona) {
      case "caring":
        return "bg-pink-50 border-pink-100 border text-pink-900";
      case "strict":
        return "bg-blue-50 border-blue-100 border text-blue-900";
      case "fun":
        return "bg-amber-50 border-amber-100 border text-amber-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const getAvatarStyle = () => {
    if (isUser) return "bg-indigo-100 text-indigo-500";
    
    switch(persona) {
      case "caring":
        return "bg-pink-100 text-pink-500";
      case "strict":
        return "bg-blue-100 text-blue-500";
      case "fun":
        return "bg-amber-100 text-amber-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getAvatarImage = () => {
    if (isUser) return "https://github.com/shadcn.png"; // ユーザーアバター
    
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

  return (
    <div 
      className={cn(
        "flex items-start space-x-2", 
        isUser ? "flex-row-reverse space-x-reverse" : "flex-row",
        !isLastInGroup ? "mb-1" : "mb-4"
      )}
    >
      {isFirstInGroup && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className={cn(
            "w-8 h-8 mt-1 shadow-sm", 
            getAvatarStyle()
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
            "px-6 py-4 shadow-sm",
            getBubbleStyle(),
            isUser ? "text-right ml-auto" : "text-left mr-auto",
            {
              'rounded-2xl rounded-br-md': isUser && isFirstInGroup && !isLastInGroup,
              'rounded-2xl rounded-tr-md': !isUser && isFirstInGroup && !isLastInGroup,
              'rounded-2xl rounded-bl-md': isUser && !isFirstInGroup && isLastInGroup,
              'rounded-2xl rounded-tl-md': !isUser && !isFirstInGroup && isLastInGroup,
              'rounded-2xl': (isUser && isFirstInGroup && isLastInGroup) || (!isUser && isFirstInGroup && isLastInGroup),
              'rounded-r-2xl rounded-l-md': isUser && !isFirstInGroup && !isLastInGroup,
              'rounded-l-2xl rounded-r-md': !isUser && !isFirstInGroup && !isLastInGroup,
            }
          )}
        >
          <ReactMarkdown
            className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-1"
            components={{
              ul: ({children}) => <ul className="space-y-1 my-2">{children}</ul>,
              li: ({children}) => (
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-500">•</span>
                  <span>{children}</span>
                </li>
              ),
              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
              a: ({children, href}) => (
                <a href={href} className="text-indigo-600 hover:text-indigo-700 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              strong: ({children}) => <strong className="font-bold">{children}</strong>
            }}
          >
            {message.content}
          </ReactMarkdown>
        </motion.div>
        {isLastInGroup && (
          <div className={cn(
            "flex mt-1",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="text-xs text-gray-400">
              {timestamp}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}