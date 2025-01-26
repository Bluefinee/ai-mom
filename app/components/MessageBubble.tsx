// MessageBubble.tsx

import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// メッセージ内容のフォーマット用ヘルパー関数
function formatMessageContent(content: string) {
  // 段落に分割
  const paragraphs = content.split(/\n{2,}/g);
  
  return paragraphs.map((paragraph, index) => {
    // 箇条書きの処理
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

// プロパティの型定義を拡張
export interface MessageBubbleProps {
  message: {
    role: "user" | "model"
    content: string
    timestamp?: number
  }
  isMobile?: boolean
  isFirstInGroup?: boolean  // グループの最初のメッセージかどうか
  isLastInGroup?: boolean   // グループの最後のメッセージかどうか
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
      // グループ内のメッセージの間隔を調整
      !isLastInGroup ? "mb-1" : "mb-4"
    )}>
      {/* アバターは最初のメッセージでのみ表示 */}
      {isFirstInGroup ? (
        <Avatar className={cn(
          "w-8 h-8 mt-1", 
          isUser ? "bg-pink-500" : "bg-blue-500"
        )} />
      ) : (
        // アバターのスペースを維持
        <div className="w-8" />
      )}
      
      <div className={cn(
        maxWidth,
        "px-6 py-4 rounded-lg leading-relaxed",
        isUser ? "bg-pink-100" : "bg-blue-100",
        isUser ? "text-right" : "text-left",
        // グループ内のメッセージの角丸を調整
        {
          'rounded-t-lg rounded-b-md': !isLastInGroup,
          'rounded-t-md rounded-b-lg': !isFirstInGroup && isLastInGroup,
          'rounded-md': !isFirstInGroup && !isLastInGroup,
        }
      )}>
        {formatMessageContent(message.content)}
      </div>
    </div>
  )
}