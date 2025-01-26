// MessageList.tsx

import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
}

interface MessageListProps {
  messages: Message[];
  isMobile: boolean;
}

/**
 * メッセージリストコンポーネント
 * チャット内のメッセージを表示し、スムーズなアニメーションを提供します。
 * 各メッセージは順番に表示され、新しいメッセージが追加されると自動的にアニメーションします。
 */
export function MessageList({ messages, isMobile }: MessageListProps) {
  // メッセージが空の場合は何も表示しない
  if (messages.length === 0) return null;

  // メッセージのアニメーション設定
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  // メッセージをグループ化する（同じ送信者の連続したメッセージをまとめる）
  const groupMessages = (msgs: Message[]) => {
    return msgs.reduce((groups: Message[][], message) => {
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup[0].role === message.role) {
        lastGroup.push(message);
      } else {
        groups.push([message]);
      }
      
      return groups;
    }, []);
  };

  const messageGroups = groupMessages(messages);

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {messageGroups.map((group, groupIndex) => (
          <motion.div
            key={`group-${groupIndex}-${group[0].timestamp}`}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-1"
          >
            {group.map((message, messageIndex) => (
              <MessageBubble
                key={`${groupIndex}-${messageIndex}-${message.timestamp}`}
                message={message}
                isMobile={isMobile}
                isFirstInGroup={messageIndex === 0}
                isLastInGroup={messageIndex === group.length - 1}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}