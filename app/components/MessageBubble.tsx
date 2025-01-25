import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-end space-x-2", isUser ? "flex-row-reverse space-x-reverse" : "flex-row")}>
      <Avatar className={cn("w-8 h-8", isUser ? "bg-pink-500" : "bg-blue-500")} />
      <div className={cn("max-w-md px-4 py-2 rounded-lg", isUser ? "bg-pink-100 text-right" : "bg-blue-100")}>
        {message.content}
      </div>
    </div>
  )
}

