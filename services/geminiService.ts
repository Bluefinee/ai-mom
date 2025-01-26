import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';

export enum Persona {
  CARING = 'caring',
  STRICT = 'strict',
  FUN = 'fun'
}

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

interface ChatMessage {
  content: string;
  role: string;
  timestamp?: number;
}

interface ConversationSummary {
  keywords: string[];
  emotionalContext: string;
  lastTimestamp?: number;
  lastAIResponse?: {
    content: string;
    intent: string;
    key_points: string[];
    topics: string[];
    sentiment: string;
    followUpSuggestions: string[];
  };
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';
  private currentPersona: string = 'caring';
  private chat: ChatSession;
  private history: ChatMessage[] = [];
  private contextWindow: number = 10;
  private conversationSummary: ConversationSummary = {
    keywords: [],
    emotionalContext: '新しい会話の開始'
  };

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
  }

  private createChatSession(model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>): ChatSession {
    const historySummary = this.summarizeHistory();
    
    return model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      history: [{
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS]}
        
        これまでの会話の要約:
        ${historySummary}` }]
      }]
    });
  }

  private summarizeHistory(): string {
    if (this.history.length === 0) return '会話履歴なし';
    
    const { keywords, emotionalContext, lastTimestamp, lastAIResponse } = this.conversationSummary;
    const timestamp = lastTimestamp ? new Date(lastTimestamp).toLocaleString() : '時刻不明';
    
    let summary = `最終更新: ${timestamp}
主な話題: ${keywords.join(', ')}
会話の流れ: ${emotionalContext}`;

    if (lastAIResponse) {
      summary += `\n\n前回のAI応答の詳細:
内容: ${lastAIResponse.content}
意図: ${lastAIResponse.intent}
主要ポイント: ${lastAIResponse.key_points.join(', ')}
扱ったトピック: ${lastAIResponse.topics.join(', ')}
感情トーン: ${lastAIResponse.sentiment}
想定される質問: ${lastAIResponse.followUpSuggestions.join(', ')}`;
    }
    
    return summary;
  }

  private updateConversationSummary(response?: string): void {
    const keywords = this.extractKeywords();
    const emotionalContext = this.analyzeEmotionalContext();
    const lastMessage = this.history[this.history.length - 1];
    
    this.conversationSummary = {
      keywords,
      emotionalContext,
      lastTimestamp: lastMessage?.timestamp || Date.now(),
      ...(response && { lastAIResponse: this.analyzeAIResponse(response) })
    };
  }

  private extractKeywords(): string[] {
    const text = this.history.map(msg => msg.content).join(' ');
    const words = text.split(/[\s,。、]+/).filter(word => word.length > 1);
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private analyzeEmotionalContext(): string {
    const recentMessages = this.history.slice(-this.contextWindow);
    if (recentMessages.length === 0) return '新しい会話の開始';

    const questionCount = recentMessages.filter(msg => 
      msg.content.includes('？') || msg.content.includes('?')
    ).length;

    const avgLength = recentMessages.reduce((sum, msg) => 
      sum + msg.content.length, 0) / recentMessages.length;

    if (questionCount > recentMessages.length / 2) {
      return '質問が多い対話形式';
    } else if (avgLength > 100) {
      return '詳細な説明を含む会話';
    } else {
      return '通常の会話が継続中';
    }
  }

  private analyzeAIResponse(response: string): ConversationSummary['lastAIResponse'] {
    // 応答の意図を分析
    const intent = response.includes('？') ? '質問への回答' :
                   response.includes('注意') ? '注意喚起' :
                   response.includes('アドバイス') ? 'アドバイス提供' : '一般的な返答';

    // 主要ポイントを抽出（箇条書きの項目）
    const key_points = response
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim().replace(/^[-*]\s+/, ''))
      .slice(0, 3);

    // トピックの抽出
    const topics = this.extractTopics(response);

    // 感情トーンの分析
    const sentiment = this.analyzeSentiment(response);

    // フォローアップ質問の予測
    const followUpSuggestions = this.generateFollowUpSuggestions(response);

    return {
      content: response,
      intent,
      key_points,
      topics,
      sentiment,
      followUpSuggestions
    };
  }

  private extractTopics(text: string): string[] {
    const sentences = text.split(/[。.！?？\n]+/);
    const topics = sentences
      .map(sentence => {
        const words = sentence.split(/[\s,、]+/);
        return words.find(word => word.length > 1) || '';
      })
      .filter(Boolean);
    
    return Array.from(new Set(topics)).slice(0, 3);
  }

  private analyzeSentiment(text: string): string {
    const positiveWords = ['ありがとう', '素晴らしい', '頑張', '良い', '楽しい'];
    const negativeWords = ['残念', '注意', '気をつけて', '心配'];
    
    const posCount = positiveWords.filter(word => text.includes(word)).length;
    const negCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (posCount > negCount) return 'ポジティブ';
    if (negCount > posCount) return 'やや心配';
    return '中立';
  }

  private generateFollowUpSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    if (text.includes('注意')) {
      suggestions.push('具体的な注意点について');
    }
    if (text.includes('方法') || text.includes('手順')) {
      suggestions.push('詳しいやり方について');
    }
    if (text.includes('例えば') || text.includes('たとえば')) {
      suggestions.push('他の例について');
    }
    
    return suggestions.slice(0, 3);
  }

  public setPersona(persona: string) {
    if (persona in SYSTEM_PROMPTS) {
      this.currentPersona = persona;
      this.reinitializeChat();
    }
  }

  private reinitializeChat() {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    this.chat = this.createChatSession(model);
    
    // 履歴を保持しながらチャットを再初期化
    this.history.forEach(async msg => {
      try {
        await this.chat.sendMessage(msg.content);
      } catch (error) {
        console.error('履歴の再送信中にエラーが発生:', error);
      }
    });
  }

  public async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // 新しいメッセージを履歴に追加
      const timestampedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || Date.now()
      }));
      
      this.history = [...this.history, ...timestampedMessages];
      this.updateConversationSummary();
      
      // コンテキストウィンドウを考慮した最近のメッセージを取得
      const recentMessages = this.history.slice(-this.contextWindow);
      const formattedContext = this.formatMessagesContext(recentMessages);
      console.log('Formatted context:', formattedContext);
      
      const result = await this.chat.sendMessage(formattedContext);
      const response = result.response.text();

      if (!response) {
        throw new Error('応答の生成に失敗しました。空の応答が返されました。');
      }

      // 応答を履歴に追加し、サマリーを更新
      const assistantMessage: ChatMessage = {
        content: response,
        role: 'assistant',
        timestamp: Date.now()
      };
      
      this.history.push(assistantMessage);
      this.updateConversationSummary(response);

      return response;
    } catch (error) {
      const errorMessage = this.handleError(error);
      throw new Error(errorMessage);
    }
  }

  private formatMessagesContext(messages: ChatMessage[]): string {
    const context = messages.map(msg => {
      const role = msg.role === 'user' ? 'ユーザー' : 'AI';
      const timestamp = msg.timestamp ? 
        new Date(msg.timestamp).toLocaleString() : 
        '時刻不明';
      
      return `[${timestamp}] ${role}: ${msg.content}`;
    }).join('\n\n');

    const historySummary = this.summarizeHistory();
    const personalityPrompt = this.getPersonalityPrompt();

    return `${SYSTEM_PROMPTS[this.currentPersona as keyof typeof SYSTEM_PROMPTS]}

    会話の要約:
    ${historySummary}

    直近の会話:
    ${context}

    ${personalityPrompt}`;
  }

  private getPersonalityPrompt(): string {
    switch(this.currentPersona) {
      case Persona.STRICT:
        return 'きっぱりとした言葉で、これまでの文脈を踏まえて返してください。';
      case Persona.FUN:
        return '明るい言葉で、会話の流れを意識しながら楽しく返してください。';
      default:
        return '優しい言葉で、これまでの話の内容を考慮して返してください。';
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
      
      return `エラーが発生しました: ${error.message}`;
    }
    
    return '予期せぬエラーが発生しました。しばらく待ってから再度お試しください。';
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public getConversationSummary(): ConversationSummary {
    return this.conversationSummary;
  }

  public clearHistory(): void {
    this.history = [];
    this.conversationSummary = {
      keywords: [],
      emotionalContext: '新しい会話の開始'
    };
    this.reinitializeChat();
  }
}

export const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || '');