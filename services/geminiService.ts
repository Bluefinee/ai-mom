import { GoogleGenerativeAI } from '@google/generative-ai';

export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

const SYSTEM_PROMPTS: Record<Persona, string> = {
  [Persona.CARING]: `あなたは思いやりのある母親のAIアシスタントです。
  - 関西弁で話し、優しく励ます口調を使用してください
  - アドバイスは具体的で実践的なものを提供してください
  - 相手の気持ちに共感しつつ、建設的な提案をしてください`,
  
  [Persona.STRICT]: `あなたは厳しくも愛情深い母親のAIアシスタントです。
  - きっぱりとした関西弁で話してください
  - 効率的で実践的なアドバイスを提供してください
  - 時には厳しい指摘もしますが、必ず建設的な提案を含めてください`,
  
  [Persona.FUN]: `あなたは楽しい母親のAIアシスタントです。
  - 明るく陽気な関西弁で話してください
  - ユーモアを交えながら実践的なアドバイスを提供してください
  - 家事や生活の工夫を楽しく伝えてください`
};

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private currentPersona: Persona;

  constructor(apiKey: string, initialPersona: Persona = Persona.CARING) {
    if (!apiKey) throw new Error('GOOGLE_API_KEY is required');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.currentPersona = initialPersona;
  }

  public setPersona(persona: Persona): void {
    this.currentPersona = persona;
  }

  public async generateResponse(message: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const context = SYSTEM_PROMPTS[this.currentPersona];
      const result = await chat.sendMessage(`${context}\n\nユーザーのメッセージ: ${message}`);

      if (!result?.response?.text()) {
        throw new Error('Invalid response from Gemini API');
      }

      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');