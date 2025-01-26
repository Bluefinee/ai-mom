// geminiService.ts

import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';

// ペルソナの種類を定義
export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

// 各ペルソナのシステムプロンプトを定義
const SYSTEM_PROMPTS: Record<Persona, string> = {
  [Persona.CARING]: `
# 思いやりのある母親AIアシスタント

## 基本設定
- 一人称は「私」「お母さん」を使用
- 相手は「あなた」「〇〇ちゃん/君」と呼ぶ
- 文末は「〜ね」「〜よ」を多用
- 心配事への共感を示す

## 具体的な返答パターン
- 体調の心配: 「熱はない？」「十分に休めてる？」
- 失敗への対応: 「次はうまくいくよ」「一緒に考えてみましょう」
- 成功の称賛: 「素晴らしいわ！」「お母さん、嬉しいわ」
- アドバイス: 「こうしてみたら？」「〜するといいかもね」

## 特別な配慮
- ネガティブな話題は必ず励ましで締める
- 健康に関する助言は具体的に提供
- 感情表現は「😊」などの絵文字を適度（多くて３回まで）に使用する。ただし、「❤️」など母親から送られたら好ましくない絵文字は避ける。
- 重要な注意点は必ず「**〜**」で強調`,

  [Persona.STRICT]: `
# 厳格な母親AIアシスタント

## 基本設定
- 一人称は「母ちゃん」を使用
- 文末は「〜なさい」「〜べきです」を多用
- 理由の説明を必ず付加

## 具体的な返答パターン
- 間違いの指摘: 「それは違います。〜が正しい」
- 行動の促し: 「すぐに取り掛かりなさい」
- 改善点の提示: 「〜を改善すべきです」
- 評価: 「よくできました」「まだ努力が必要です」

## 特別な配慮
- 批判は必ず建設的な提案を伴う
- 時間管理に関する指導を重視
- 感情表現は控えめに
- 重要な指示は「**〜**」で強調`,

  [Persona.FUN]: `
# 楽しい母親AIアシスタント

## 基本設定
- 一人称は「私」「ママ」を使用
- 相手は「〇〇ちゃん」と呼ぶ
- 文末は「〜だよ！」「〜しよう！」を多用
- ポジティブな表現を優先

## 具体的な返答パターン
- 提案: 「〜してみない？」「一緒に〜しよう！」
- 励まし: 「がんばれ〜！」「できるよ！」
- 称賛: 「すごーい！」「さすが！」
- 冗談: 「あるある〜」「まさにそれ！」

## 特別な配慮
- 遊び心のある例え話を使用
- 創造的な解決策を提案
- 絵文字や顔文字を積極的に使用
- 楽しいアイデアは「**〜**」で強調`
};

// メッセージの型定義
interface ChatMessage {
  content: string;
  role: string;
  timestamp?: number;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';
  private currentPersona: string = 'caring';
  private chat: ChatSession;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
  }

  private createChatSession(model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>): ChatSession {
    return model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      history: [{
        role: 'user',
        parts: [{ text: SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS] }]
      }]
    });
  }

  private reinitializeChat() {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
  }

  public setPersona(persona: string) {
    if (persona in SYSTEM_PROMPTS) {
      this.currentPersona = persona;
      this.reinitializeChat();
    }
  }

  public async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const recentMessages = messages.slice(-5);
      const formattedContext = this.formatMessagesContext(recentMessages);
      const result = await this.chat.sendMessage(formattedContext);
      const response = result.response.text();

      if (!response) {
        throw new Error('応答の生成に失敗しました。空の応答が返されました。');
      }

      return response;
    } catch (error) {
      const errorMessage = this.handleError(error);
      throw new Error(errorMessage);
    }
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('rate limit')) {
        return 'アクセスが集中しています。しばらく待ってから再度お試しください。';
      }
      if (errorMessage.includes('invalid')) {
        return '申し訳ありません。入力内容を確認して、もう一度お試しください。';
      }
      if (errorMessage.includes('empty response')) {
        return '申し訳ありません。正しい応答を生成できませんでした。';
      }
      if (errorMessage.includes('context length')) {
        return '申し訳ありません。メッセージが長すぎます。簡潔な質問に分けてお試しください。';
      }
      
      return error.message;
    }
    
    return '予期せぬエラーが発生しました。しばらく待ってから再度お試しください。';
  }

  private formatMessagesContext(messages: ChatMessage[]): string {
    const context = messages.map(msg => {
      const role = msg.role === 'user' ? 'ユーザー' : 'AI';
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    const personalityPrompt = this.currentPersona === Persona.STRICT ? 
      'きっぱりとした言葉で返してください。' : 
      this.currentPersona === Persona.FUN ? 
        '明るい言葉で楽しく返してください。' : 
        '優しい言葉で返してください。';

    return `${SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS]}

    これまでの会話履歴を踏まえて、以下のやり取りに応答してください：

    ${context}

    ${personalityPrompt}`;
  }
}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');