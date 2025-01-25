import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const personas = [
  { id: "caring", name: "思いやりのある母", description: "優しく励ましてくれる母親のようなAI" },
  { id: "strict", name: "厳しい母", description: "厳しくも愛情深い母親のようなAI" },
  { id: "fun", name: "楽しい母", description: "ユーモアたっぷりの母親のようなAI" },
]

interface PersonaSelectionProps {
  onSelect: (persona: string) => void
}

export function PersonaSelection({ onSelect }: PersonaSelectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">AI母ちゃん</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <TooltipProvider key={persona.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                  onClick={() => onSelect(persona.id)}
                >
                  <CardHeader>
                    <CardTitle>{persona.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{persona.description}</CardDescription>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>クリックして選択</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

