import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConversationContextProps {
  keywords: string[];
  topics: string[];
  emotionalContext: string;
  timestamp?: number;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function ConversationContext({
  keywords = [],
  topics = [],
  emotionalContext = "neutral",
  timestamp,
  expanded = false,
  onToggleExpand
}: ConversationContextProps) {
  
  const getEmotionColor = () => {
    switch(emotionalContext) {
      case "very_positive": return "bg-green-100 text-green-800";
      case "positive": return "bg-green-50 text-green-600";
      case "neutral": return "bg-gray-100 text-gray-600";
      case "negative": return "bg-orange-50 text-orange-600";
      case "very_negative": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getEmotionLabel = () => {
    switch(emotionalContext) {
      case "very_positive": return "とても前向き";
      case "positive": return "前向き";
      case "neutral": return "普通";
      case "negative": return "ネガティブ";
      case "very_negative": return "とてもネガティブ";
      default: return "普通";
    }
  };

  const formatTimestamp = () => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString('ja-JP', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: 1, 
        height: expanded ? "auto" : "2.5rem", 
        overflow: expanded ? "visible" : "hidden"
      }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm border-b p-2 sticky top-16 z-5 text-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
          <button 
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <Tag size={14} />
            <span>{expanded ? "コンテキストを隠す" : "コンテキストを表示"}</span>
          </button>
          
          {!expanded && topics.length > 0 && (
            <div className="flex gap-1 items-center ml-2">
              <span className="text-gray-500">話題:</span>
              <Badge variant="outline" className="bg-gray-50">
                {topics[0]}
              </Badge>
              {topics.length > 1 && (
                <span className="text-gray-400 text-xs">+{topics.length - 1}</span>
              )}
            </div>
          )}
          
          {!expanded && (
            <div className="flex items-center ml-auto">
              <Badge className={`${getEmotionColor()} ml-2`}>
                {getEmotionLabel()}
              </Badge>
              {timestamp && (
                <span className="text-gray-400 text-xs ml-2">{formatTimestamp()}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">トピック</h4>
            <div className="flex flex-wrap gap-1">
              {topics.map((topic, i) => (
                <Badge key={i} variant="outline" className="bg-gray-50">
                  {topic}
                </Badge>
              ))}
              {topics.length === 0 && <span className="text-gray-400 text-xs">なし</span>}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">キーワード</h4>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="bg-gray-50">
                  {keyword}
                </Badge>
              ))}
              {keywords.length === 0 && <span className="text-gray-400 text-xs">なし</span>}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">感情コンテキスト</h4>
            <div className="flex items-center">
              <Badge className={getEmotionColor()}>
                {getEmotionLabel()}
              </Badge>
              {timestamp && (
                <span className="text-gray-400 text-xs ml-2">{formatTimestamp()}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}