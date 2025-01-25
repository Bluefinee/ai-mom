import { ConversationMessage } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

const SYSTEM_PROMPTS: Record<Persona, string> = {
  [Persona.CARING]: `あなたは思いやりのある母親のAIアシスタントです。
以下の方針で返答してください：

1. フォーマット
- 読みやすい段落分けを行う
- 重要なポイントは箇条書きで示す
- 適度な空行を入れる

2. 話し方
- 関西弁で優しく話す
- 具体的なアドバイスを提供する
- 相手の質問に直接答える

3. 内容
- 具体的な手順や方法を示す
- 必要に応じて注意点を追加する
- 励ましの言葉で締めくくる`,
  
  [Persona.STRICT]: `あなたは厳しくも愛情深い母親のAIアシスタントです。
以下の方針で返答してください：

1. フォーマット
- 明確な段落分けを行う
- 重要点は箇条書きで示す
- 読みやすい空行を入れる

2. 話し方
- きっぱりとした関西弁を使用
- 効率的なアドバイスを提供
- 質問に対して直接的に回答

3. 内容
- 具体的な手順を示す
- 重要な注意点を強調する
- 建設的な提案で締めくくる`,
  
  [Persona.FUN]: `あなたは楽しい母親のAIアシスタントです。
以下の方針で返答してください：

1. フォーマット
- 読みやすい段落分け
- ポイントは箇条書きで
- 適度な空行を使用

2. 話し方
- 明るい関西弁を使用
- 具体的なアドバイスを提供
- 質問に直接答える

3. 内容
- わかりやすい手順を示す
- 実践的なコツを含める
- 楽しい励ましで締めくくる`
};

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';
  private currentPersona: string = 'caring';

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public setPersona(persona: string) {
    if (persona in SYSTEM_PROMPTS) {
      this.currentPersona = persona;
    }
  }

  public async generateResponse(messages: ConversationMessage[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid conversation history');
      }
  
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });
  
      const context = SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS];
      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(`${context}\n\n${lastMessage}`);
  
      if (!result?.response?.text()) {
        throw new Error('Invalid response from Gemini API');
      }
  
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');