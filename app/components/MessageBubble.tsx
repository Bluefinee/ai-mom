import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
  message: {
    role: "user" | "model"
    content: string
    timestamp?: number
  }
  isMobile?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
}

export function MessageBubble({ 
  message, 
  isMobile = false,
  isFirstInGroup = true,
  isLastInGroup = true 
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const maxWidth = isMobile ? "w-3/4" : "max-w-2xl"

  return (
    <div className={cn(
      "flex items-start space-x-2", 
      isUser ? "flex-row-reverse space-x-reverse" : "flex-row",
      !isLastInGroup ? "mb-1" : "mb-4"
    )}>
      {isFirstInGroup && (
        <Avatar className={cn(
          "w-8 h-8 mt-1", 
          isUser ? "bg-pink-500" : "bg-blue-500"
        )}>
          <AvatarImage 
            src={isUser ? "https://github.com/shadcn.png" : "/images/japanese-mom.png"} 
            alt={isUser ? "User Avatar" : "Model Avatar"}
          />
        </Avatar>
      )}
      
      <div className={cn(
        maxWidth,
        "px-6 py-4 rounded-lg",
        isUser ? "bg-pink-100" : "bg-blue-100",
        isUser ? "text-right" : "text-left",
        {
          'rounded-t-lg rounded-b-md': !isLastInGroup,
          'rounded-t-md rounded-b-lg': !isFirstInGroup && isLastInGroup,
          'rounded-md': !isFirstInGroup && !isLastInGroup,
        }
      )}>
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
      </div>
    </div>
  )
}