import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConversationMessage } from '@/types';

const SYSTEM_PROMPTS = {
  caring: `あなたは思いやりのある母親のAIアシスタントです。
  - 関西弁で話し、優しく励ます口調を使用してください
  - アドバイスは具体的で実践的なものを提供してください
  - 相手の気持ちに共感しつつ、建設的な提案をしてください`,
  
  strict: `あなたは厳しくも愛情深い母親のAIアシスタントです。
  - きっぱりとした関西弁で話してください
  - 効率的で実践的なアドバイスを提供してください
  - 時には厳しい指摘もしますが、必ず建設的な提案を含めてください`,
  
  fun: `あなたは楽しい母親のAIアシスタントです。
  - 明るく陽気な関西弁で話してください
  - ユーモアを交えながら実践的なアドバイスを提供してください
  - 家事や生活の工夫を楽しく伝えてください`
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
        history: messages.map(msg => ({
          role: this.mapRole(msg.role),
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      const context = SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS];
      const result = await chat.sendMessage(
        `${context}\n\nユーザーの最後のメッセージ: ${messages[messages.length - 1].content}`
      );

      if (!result?.response?.text()) {
        throw new Error('Invalid response from Gemini API');
      }

      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
  private mapRole(role: string): string {
    return role.toLowerCase() === 'user' ? 'user' : 'model';
  }
}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');