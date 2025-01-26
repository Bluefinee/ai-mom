import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Helper function to format message content
function formatMessageContent(content: string) {
  // Split content into paragraphs
  const paragraphs = content.split(/\n{2,}/g);
  
  return paragraphs.map((paragraph, index) => {
    // Check if paragraph contains bullet points
    if (paragraph.includes('* ')) {
      const items = paragraph.split('* ').filter(Boolean);
      return (
        <ul key={index} className="space-y-2 my-4">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{item.trim()}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    return (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph.trim()}
      </p>
    );
  });
}

export interface MessageBubbleProps {
  message: {
    role: "user" | "model"
    content: string
  }
  isMobile?: boolean
}

export function MessageBubble({ message, isMobile = false }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const maxWidth = isMobile ? "w-3/4" : "max-w-2xl"

  return (
    <div className={cn(
      "flex items-start space-x-2 mb-4", 
      isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
    )}>
      <Avatar className={cn(
        "w-8 h-8 mt-1", 
        isUser ? "bg-pink-500" : "bg-blue-500"
      )} />
      <div className={cn(
        maxWidth,
        "px-6 py-4 rounded-lg leading-relaxed",
        isUser ? "bg-pink-100" : "bg-blue-100",
        isUser ? "text-right" : "text-left"
      )}>
        {formatMessageContent(message.content)}
      </div>
    </div>
  )
}