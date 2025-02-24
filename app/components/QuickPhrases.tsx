import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CommandIcon, X } from "lucide-react";

interface QuickPhrasesProps {
  persona: string;
  onSelectPhrase: (phrase: string) => void;
}

export function QuickPhrases({ persona, onSelectPhrase }: QuickPhrasesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CommandIcon size={16} />
        <span className="text-xs">よく使うフレーズ</span>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 w-60 z-10"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">よく使うフレーズ</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
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
                  className="justify-start text-left h-8"
                  onClick={() => {
                    onSelectPhrase(phrase);
                    setIsOpen(false);
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