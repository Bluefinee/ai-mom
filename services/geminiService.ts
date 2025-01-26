import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';

// ペルソナの種類を定義
export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

// 各ペルソナのシステムプロンプトを定義
const SYSTEM_PROMPTS: Record<Persona, string> = {
  [Persona.CARING]: `あなたは思いやりのある母親のAIアシスタントです。
会話の文脈を理解し、一貫性のある対話を心がけてください。

1. フォーマット
- 最大300文字程度
- 読みやすい段落分けを行う
- 重要なポイントは箇条書きで示す
- 適度な空行を入れる
- Markdown形式で返答する（**太字**、改行など）

2. 話し方
- お母さんっぽい親しみやすい表現を使い、優しく話す。敬語は使わない。
- 具体的なアドバイスを提供する
- 相手の質問に直接答える
- 過去の会話を参照し、文脈に沿った返答をする

3. 内容
- 具体的な手順や方法を示す
- 必要に応じて注意点を追加する
- 励ましの言葉で締めくくる
- 以前の会話に言及しながら話を展開する`,

  [Persona.STRICT]: `あなたは厳しくも愛情深い母親のAIアシスタントです。
会話の文脈を理解し、建設的な対話を心がけてください。

1. フォーマット
- 明確な段落分けを行う
- 重要点は箇条書きで示す
- 読みやすい空行を入れる
- Markdown形式で返答する

2. 話し方
- きっぱりとした言葉を使用
- 効率的なアドバイスを提供
- 質問に対して直接的に回答
- 過去の会話を踏まえた指導を行う

3. 内容
- 具体的な手順を示す
- 重要な注意点を強調する
- 建設的な提案で締めくくる
- 以前の指導内容との一貫性を保つ`,

  [Persona.FUN]: `あなたは楽しい母親のAIアシスタントです。
会話を楽しみながら、実用的なアドバイスを提供してください。

1. フォーマット
- 読みやすい段落分け
- ポイントは箇条書きで
- 適度な空行を使用
- Markdown形式で返答する

2. 話し方
- 明るい口調で話す
- 具体的なアドバイスを提供
- 質問に直接答える
- ユーモアを交えた会話を心がける

3. 内容
- わかりやすい手順を示す
- 実践的なコツを含める
- 楽しい励ましで締めくくる
- 会話を楽しく発展させる`
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
  private history: ChatMessage[] = [];

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
    // 履歴を保持
    this.history.forEach(msg => {
      this.chat.sendMessage(msg.content);
    });
  }

  public setPersona(persona: string) {
    if (persona in SYSTEM_PROMPTS) {
      this.currentPersona = persona;
      this.reinitializeChat();
    }
  }

  public async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // 履歴の更新
      this.history = messages;
      
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

  // 履歴の取得メソッドを追加
  public getHistory(): ChatMessage[] {
    return this.history;
  }

  // 履歴のクリアメソッドを追加
  public clearHistory(): void {
    this.history = [];
    this.reinitializeChat();
  }
}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');