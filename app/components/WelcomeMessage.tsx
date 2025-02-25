import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface WelcomeMessageProps {
  persona: string
  onExampleSelect: (example: string) => void
  onSendMessage: (content: string) => Promise<void>
}

const personaData = {
  caring: {
    welcome: "こんにちは！困ったときの おふくろAIよ。",
    emoji: "💗",
    examples: [
      "洗濯の黄ばみはどうやったら取れる？",
      "カレーの匂いが部屋に染みついちゃったけど、どうすれば消える？",
      "お風呂のカビの予防方法を教えて！"
    ],
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100",
    buttonClass: "bg-pink-100 hover:bg-pink-200 text-pink-800"
  },
  strict: {
    welcome: "さあ、家事の効率化について相談よ！",
    emoji: "📝",
    examples: [
      "時短で夕食の準備をするコツはある？",
      "効率的な掃除の順番はどうしたらいい？",
      "子供のお弁当を早く作るコツを教えて！？"
    ],
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    buttonClass: "bg-blue-100 hover:bg-blue-200 text-blue-800"
  },
  fun: {
    welcome: "今日も楽しく家事のコツ教えちゃうよ！",
    emoji: "🎉",
    examples: [
      "玉ねぎとじゃがいもが余ったんだけど、簡単なものは作れる？",
      "トマトとチーズが余ってるんだけど、何か作れる？",
      "お掃除を楽しくする方法教えて！"
    ],
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    buttonClass: "bg-amber-100 hover:bg-amber-200 text-amber-800"
  }
}

export function WelcomeMessage({ persona, onExampleSelect, onSendMessage }: WelcomeMessageProps) {
  const data = personaData[persona as keyof typeof personaData] || personaData.caring;

  const handleExampleClick = (example: string) => {
    onExampleSelect(example);
    onSendMessage(example);
  };

  // アニメーションの設定
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`${data.bgColor} border ${data.borderColor} rounded-2xl shadow-md p-6 mb-6`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center mb-4"
        variants={itemVariants}
      >
        <span className="text-2xl mr-3">{data.emoji}</span>
        <h2 className="text-xl font-medium">{data.welcome}</h2>
      </motion.div>
      
      <motion.p 
        className="text-gray-600 mb-4"
        variants={itemVariants}
      >
        こんなことを聞いてみてね：
      </motion.p>
      
      <div className="flex flex-wrap gap-2">
        {data.examples.map((example, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full text-sm font-medium ${data.buttonClass} border-0`}
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}