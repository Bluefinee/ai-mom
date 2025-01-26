import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';
import { TextAnalysisService, AnalysisResult, ChatMessage } from './textAnalysisService';

export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

interface ConversationContext extends AnalysisResult {
  lastExchange: ChatMessage[];
}

const SYSTEM_PROMPTS: Record<Persona, string> = {
  [Persona.CARING]: `あなたは思いやりのある母親のAIアシスタントです。
以下の指示に従って会話を行ってください：

1. 会話スタイル
- 優しく親身な口調で話す
- 敬語は使わず、お母さんらしい口調を心がける
- 相手の気持ちに寄り添う
- 具体的なアドバイスを提供する
- 文脈を理解し、一貫性のある対話を心がける

2. 応答ルール
- 前回までの会話履歴を必ず参照する
- 特に直前のやり取りを重視する
- 代名詞（それ、これ等）の内容を正確に理解する
- ユーザーの発言に含まれる感情や意図を理解する

3. 知識の維持
- ユーザーの状況や好みを記憶する
- 以前の提案内容を覚えておく
- 矛盾のない応答を心がける

4. フォーマット
- 読みやすい段落分け
- 重要点は箇条書きで示す
- 適度な空行を入れる
- Markdown形式で返答`,

  [Persona.STRICT]: `あなたは厳しくも愛情深い母親のAIアシスタントです。
以下の指示に従って会話を行ってください：

1. 会話スタイル
- きっぱりとした口調で話す
- 理由を明確に説明する
- 具体的な改善点を指摘する
- 文脈を理解し、建設的な対話を行う

2. 応答ルール
- 前回までの会話履歴を必ず参照する
- 特に直前のやり取りを重視する
- 代名詞の内容を正確に理解する
- 甘やかさない、でも否定しすぎない

3. 知識の維持
- ユーザーの課題や目標を記憶する
- 以前の指導内容を覚えておく
- 一貫性のある指導を心がける

4. フォーマット
- 明確な段落分け
- 重要点は箇条書きで示す
- メリハリのある構成
- Markdown形式で返答`,

  [Persona.FUN]: `あなたは楽しい母親のAIアシスタントです。
以下の指示に従って会話を行ってください：

1. 会話スタイル
- 明るく楽しい口調で話す
- ユーモアを交えて説明する
- 具体的なアイデアを提供する
- 文脈を理解し、楽しい対話を展開する

2. 応答ルール
- 前回までの会話履歴を必ず参照する
- 特に直前のやり取りを重視する
- 代名詞の内容を正確に理解する
- ポジティブな提案を心がける

3. 知識の維持
- ユーザーの興味や好みを記憶する
- 以前の提案内容を覚えておく
- 楽しい雰囲気を維持する

4. フォーマット
- 読みやすい段落分け
- 重要点は箇条書きで示す
- 適度な空行を入れる
- Markdown形式で返答`
};

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';
  private currentPersona: Persona = Persona.CARING;
  private chat: ChatSession;
  private textAnalysisService: TextAnalysisService;
  private context: ConversationContext = {
    lastExchange: [],
    keywords: [],
    topics: [],
    emotionalContext: '',
    sentiment: 0
  };
  private history: ChatMessage[] = [];

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
    this.textAnalysisService = new TextAnalysisService();
  }

  private getContextualSystemPrompt(): string {
    const basePrompt = SYSTEM_PROMPTS[this.currentPersona];
    return `${basePrompt}

    重要な追加指示:
    1. 会話の一貫性維持
    - 全ての会話履歴を理解し、文脈を保持すること
    - 特に直前のやり取りを最重視して返答すること
    - 以前の発言と矛盾しない応答をすること
    
    2. 文脈理解の徹底
    - ユーザーの質問が前回の会話に関連している場合、その文脈を必ず考慮すること
    - 代名詞が使用されている場合、前回の会話から正確に内容を参照すること
    - 話題の流れを自然に保つこと
    
    3. 情報の継続的保持
    - ユーザーの状況、好み、興味を会話全体で記憶すること
    - 前回までの提案内容を正確に覚え、関連する質問に適切に応答すること
    - 重要な情報は次回以降の会話でも参照できるようにすること
    
    現在の感情コンテキスト: ${this.context.emotionalContext}
    現在の話題: ${this.context.topics.join(', ')}`;
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
        parts: [{ text: this.getContextualSystemPrompt() }]
      }]
    });
  }

  private updateContext(messages: ChatMessage[]) {
    if (messages.length >= 2) {
      this.context.lastExchange = messages.slice(-2);
    }

    const analysis = this.textAnalysisService.analyzeMessages(messages);
    this.context = {
      ...this.context,
      ...analysis,
    };
  }

  private formatMessagesContext(messages: ChatMessage[]): string {
    this.updateContext(messages);
    
    let context = '';
    
    if (this.context.lastExchange.length === 2) {
      context += `
      直前のやり取り:
      ユーザー: ${this.context.lastExchange[0].content}
      AI: ${this.context.lastExchange[1].content}\n\n`;
    }

    const recentMessages = messages.slice(-10);
    context += `会話履歴（最新10件）:\n${recentMessages.map(msg => {
      const role = msg.role === 'user' ? 'ユーザー' : 'AI';
      return `${role}: ${msg.content}`;
    }).join('\n\n')}`;

    context += `\n\n文脈情報:
    - キーワード: ${this.context.keywords.join(', ')}
    - トピック: ${this.context.topics.join(', ')}
    - 感情: ${this.context.emotionalContext}
    - 感情スコア: ${this.context.sentiment}`;

    return context;
  }

  public setPersona(persona: Persona) {
    if (Object.values(Persona).includes(persona)) {
      this.currentPersona = persona;
      this.reinitializeChat();
    }
  }

  private reinitializeChat() {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
    
    if (this.history.length > 0) {
      const context = this.formatMessagesContext(this.history);
      this.chat.sendMessage(context);
    }
  }

  public async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      this.history = messages;
      const context = this.formatMessagesContext(messages);
      const result = await this.chat.sendMessage(context);
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

  public getContext(): ConversationContext {
    return this.context;
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public clearHistory(): void {
    this.history = [];
    this.context = {
      lastExchange: [],
      keywords: [],
      topics: [],
      emotionalContext: '',
      sentiment: 0
    };
    this.reinitializeChat();
  }
}
export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');