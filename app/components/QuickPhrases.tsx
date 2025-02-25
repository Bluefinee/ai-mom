import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CommandIcon, X } from "lucide-react";

interface QuickPhrasesProps {
  persona: string;
  onSelectPhrase: (phrase: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// WelcomeMessage.tsxから引用した例文（文字数調整版）
const personaData = {
  caring: {
    examples: [
      "洗濯の黄ばみを取る方法は？",
      "部屋のカレー臭を消すには？",
      "お風呂のカビの予防方法は？"
    ],
    bgColor: "bg-pink-50",
    hoverColor: "hover:bg-pink-100",
    textColor: "text-pink-700",
    borderColor: "border-pink-100",
  },
  strict: {
    examples: [
      "夕食を時短で作るコツは？",
      "効率的な掃除の順番は？",
      "子供のお弁当を早く作るには？"
    ],
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-100",
  },
  fun: {
    examples: [
      "玉ねぎとじゃがいもで何作れる？",
      "トマトとチーズの簡単レシピは？",
      "掃除を楽しくするコツは？"
    ],
    bgColor: "bg-amber-50",
    hoverColor: "hover:bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-100",
  }
};

export function QuickPhrases({ persona, onSelectPhrase, isOpen, setIsOpen }: QuickPhrasesProps) {
  // ペルソナに応じた色とフレーズを設定
  const data = personaData[persona as keyof typeof personaData] || personaData.caring;

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
        <span className="text-xs">聞いてみる</span>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-3 w-72 z-20 border ${data.borderColor}`}
            style={{ 
              transformOrigin: "bottom center",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-sm font-medium ${data.textColor}`}>聞いてみたいこと</h3>
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
              {data.examples.map((phrase, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className={`justify-start text-left h-auto py-2 px-3 rounded-md text-gray-700 ${data.bgColor} ${data.hoverColor} transition-colors`}
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