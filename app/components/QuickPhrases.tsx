import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CommandIcon, X } from "lucide-react";

interface QuickPhrasesProps {
  persona: string;
  onSelectPhrase: (phrase: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function QuickPhrases({ persona, onSelectPhrase, isOpen, setIsOpen }: QuickPhrasesProps) {
  // ペルソナごとのフレーズ設定
  const getPhrases = () => {
    switch(persona) {
      case "caring":
        return [
          "おはよう",
          "最近どう？",
          "ありがとう",
          "助けてもらえる？",
          "アドバイスが欲しい"
        ];
      case "strict":
        return [
          "おはよう",
          "進捗はどう？",
          "教えてください",
          "どう思いますか？",
          "アドバイスをお願いします"
        ];
      case "fun":
        return [
          "おはよー！",
          "元気？", 
          "ありがとう！",
          "何か面白いこと教えて",
          "今日は何しようかな"
        ];
      default:
        return [
          "おはよう",
          "こんにちは",
          "ありがとう",
          "助けて",
          "アドバイスが欲しい"
        ];
    }
  };

  // ペルソナに応じた色を設定
  const getPersonaColor = () => {
    switch(persona) {
      case "caring": return "bg-pink-50 hover:bg-pink-100";
      case "strict": return "bg-blue-50 hover:bg-blue-100";
      case "fun": return "bg-amber-50 hover:bg-amber-100";
      default: return "bg-gray-50 hover:bg-gray-100";
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center gap-1 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CommandIcon size={16} />
        <span className="text-xs">よく使うフレーズ</span>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-3 w-64 z-20 border border-indigo-100"
            style={{ 
              transformOrigin: "bottom center",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-indigo-700">よく使うフレーズ</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" 
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {getPhrases().map((phrase, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className={`justify-start text-left h-8 rounded-md text-gray-700 ${getPersonaColor()} transition-colors`}
                  onClick={() => {
                    onSelectPhrase(phrase);
                  }}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}