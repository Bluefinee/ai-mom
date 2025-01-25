import { Button } from "@/components/ui/button"

interface WelcomeMessageProps {
  persona: string
  onExampleSelect: (example: string) => void
}

const personaData = {
  caring: {
    welcome: "こんにちは！困ったときの AI母ちゃんよ。",
    examples: [
      "掃除機のゴミパックの替え方がわからない",
      "シミ抜きの方法を教えて",
      "レンジの掃除方法は？"
      ],
    },
    strict: {
      welcome: "さあ、家事の効率化について相談よ！",
      examples: [
      "冷蔵庫の整理整頓のコツは？",
      "洗濯物を早く乾かすには？",
      "食器の水垢の取り方を教えて"
      ],
    },
    fun: {
      welcome: "今日も楽しく家事のコツ教えちゃうよ！",
      examples: [
      "余り物でパパッと作れる料理は？",
      "お風呂掃除を楽しくする方法ない？",
      "子供と一緒に楽しくお片付け！"
      ],
    }
}

export function WelcomeMessage({ persona, onExampleSelect }: WelcomeMessageProps) {
  const { welcome, examples } = personaData[persona as keyof typeof personaData]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <p className="text-lg font-medium mb-2">{welcome}</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <Button key={index} variant="outline" size="sm" onClick={() => onExampleSelect(example)}>
            {example}
          </Button>
        ))}
      </div>
    </div>
  )
}

