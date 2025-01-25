import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConversationMessage } from '@/types';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: string = 'gemini-1.5-flash';
  
    constructor(apiKey: string) {
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY is not defined');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  
    public async generateResponse(conversation: ConversationMessage[]): Promise<string> {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.model });
  
        if (!Array.isArray(conversation) || conversation.length === 0) {
          throw new Error('Invalid conversation history');
        }

        // History functionality commented out
        const chat = model.startChat({
          // history: messages,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        });
  
        const result = await chat.sendMessage('上記の会話を踏まえて、旅行プランについてアドバイスしてください。');
        
        if (!result || !result.response) {
          throw new Error('Invalid response from Gemini API');
        }
  
        return result.response.text();
      } catch (error) {
        console.error('Gemini API Error:', error);
        if (error instanceof Error) {
          throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('旅行プランの生成中に予期せぬエラーが発生しました。');
      }
    }
  
    private mapRole(role: string): string {
      switch (role.toLowerCase()) {
        case 'user':
          return 'user';
        case 'assistant':
          return 'model';
        default:
          return 'user';
      }
    }
}
  
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY is not defined in environment variables');
}
  
export const geminiService = new GeminiService(GOOGLE_API_KEY || '');