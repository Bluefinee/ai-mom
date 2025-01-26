import { Button } from "@/components/ui/button"

interface WelcomeMessageProps {
  persona: string
  onExampleSelect: (example: string) => void
  onSendMessage: (content: string) => Promise<void>
}

const personaData = {
  caring: {
    welcome: "こんにちは！困ったときの なんでもかあちゃんよ。",
    examples: [
      "洗濯の黄ばみはどうやったら取れる？",
      "カレーの匂いが部屋に染みついちゃったけど、どうすれば消える？",
      "お風呂のカビの予防方法を教えて！"
    ],
  },
  strict: {
    welcome: "さあ、家事の効率化について相談よ！",
    examples: [
      "時短で夕食の準備をするコツはある？",
      "効率的な掃除の順番はどうしたらいい？",
      "子供のお弁当を早く作るコツを教えて！？"
    ],
  },
  fun: {
    welcome: "今日も楽しく家事のコツ教えちゃうよ！",
    examples: [
      "玉ねぎとじゃがいもが余ったんだけど、簡単なものは作れる？",
      "トマトとチーズが余ってるんだけど、何か作れる？",
      "お掃除を楽しくする方法教えて！"
    ],
  }
}

export function WelcomeMessage({ persona, onExampleSelect, onSendMessage }: WelcomeMessageProps) {
  const { welcome, examples } = personaData[persona as keyof typeof personaData]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <p className="text-lg font-medium mb-2">{welcome}</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <Button 
            key={index} 
            variant="outline" 
            size="sm" 
            onClick={() => {
              onExampleSelect(example)
              onSendMessage(example)
            }}
          >
            {example}
          </Button>
        ))}
      </div>
    </div>
  )
}