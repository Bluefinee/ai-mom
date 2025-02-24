import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MessageFeedbackProps {
  messageId: number;
  onFeedback: (messageId: number, helpful: boolean) => void;
  onSave: (messageId: number) => void;
}

export function MessageFeedback({ messageId, onFeedback, onSave }: MessageFeedbackProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"helpful" | "unhelpful" | null>(null);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleFeedback = (helpful: boolean) => {
    onFeedback(messageId, helpful);
    setFeedbackGiven(helpful ? "helpful" : "unhelpful");
    
    toast({
      title: helpful ? "ありがとうございます！" : "フィードバックをありがとう",
      description: helpful ? "お役に立てて嬉しいです" : "より良い回答ができるよう努力します",
      duration: 3000
    });
  };

  const handleSave = () => {
    onSave(messageId);
    setSaved(!saved);
    
    toast({
      title: saved ? "お気に入りから削除しました" : "お気に入りに追加しました",
      description: saved ? "お気に入りから削除されました" : "マイページからいつでも見返せます",
      duration: 3000
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2 text-gray-500 text-xs mt-1"
    >
      <div className="flex items-center">
        <span className="mr-2">役に立ちましたか？</span>
        <Button
          variant="ghost"
          size="sm"
          className={`p-1 ${feedbackGiven === "helpful" ? "text-green-500" : ""}`}
          onClick={() => handleFeedback(true)}
        >
          <ThumbsUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`p-1 ${feedbackGiven === "unhelpful" ? "text-red-500" : ""}`}
          onClick={() => handleFeedback(false)}
        >
          <ThumbsDown size={16} />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${saved ? "text-yellow-500" : ""}`}
        onClick={handleSave}
        title="お気に入りに追加"
      >
        <Bookmark size={16} />
      </Button>
    </motion.div>
  );
}