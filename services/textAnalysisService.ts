

export interface AnalysisResult {
  keywords: string[];
  topics: string[];
  emotionalContext: string;
  sentiment: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface EmotionalWord {
  word: string;
  weight: number;
}

export class TextAnalysisService {
  private readonly positiveWords: EmotionalWord[] = [
    { word: '良い', weight: 1 },
    { word: '嬉しい', weight: 1.2 },
    { word: '楽しい', weight: 1.2 },
    { word: '好き', weight: 1 },
    { word: '素晴らしい', weight: 1.5 },
    { word: '安心', weight: 0.8 },
    { word: '幸せ', weight: 1.3 },
    { word: '希望', weight: 0.9 }
  ];
  
  private readonly negativeWords: EmotionalWord[] = [
    { word: '悪い', weight: -1 },
    { word: '辛い', weight: -1.2 },
    { word: '苦しい', weight: -1.2 },
    { word: '嫌い', weight: -1 },
    { word: '酷い', weight: -1.5 },
    { word: '不安', weight: -0.8 },
    { word: '悲しい', weight: -1.3 },
    { word: '怒り', weight: -1.4 }
  ];

  private readonly emotionModifiers = {
    intensifiers: ['とても', 'すごく', '本当に', '非常に'],
    diminishers: ['少し', 'やや', 'ちょっと', '多少'],
    negators: ['ない', 'ません', '無い', '不']
  };

  constructor() {}

  public analyzeMessages(messages: ChatMessage[]): AnalysisResult {
    const latestMessage = messages[messages.length - 1];
    const words = this.simpleTokenize(latestMessage.content);
    const sentiment = this.analyzeSentiment(words);

    return {
      keywords: this.extractKeywords(words),
      topics: this.analyzeTopics(words),
      emotionalContext: this.getEmotionalContext(sentiment),
      sentiment: sentiment
    };
  }

  private simpleTokenize(text: string): string[] {
    return text
      .replace(/[、。！？]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private extractKeywords(words: string[]): string[] {
    return words
      .filter(word => 
        !['は', 'が', 'の', 'に', 'と', 'で', 'を', 'な', 'も', 'や'].includes(word)
      )
      .slice(0, 5);
  }

  private analyzeTopics(words: string[]): string[] {
    const topicMap = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 1 && !this.isStopWord(word)) {
        const count = topicMap.get(word) || 0;
        topicMap.set(word, count + 1);
      }
    });

    return Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['です', 'ます', 'した', 'する', 'ある', 'いる', 'なる'];
    return stopWords.some(stop => word.includes(stop));
  }

  private analyzeSentiment(words: string[]): number {
    let sentiment = 0;
    let multiplier = 1;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const emotionalWeight = this.getEmotionalWeight(word);

      if (emotionalWeight !== 0) {
        const prevWord = words[i - 1];
        if (prevWord) {
          if (this.emotionModifiers.intensifiers.includes(prevWord)) {
            multiplier = 1.5;
          } else if (this.emotionModifiers.diminishers.includes(prevWord)) {
            multiplier = 0.5;
          }
        }

        const nextWord = words[i + 1];
        if (nextWord && this.emotionModifiers.negators.some(neg => nextWord.includes(neg))) {
          multiplier *= -1;
        }

        sentiment += emotionalWeight * multiplier;
        multiplier = 1;
      }
    }

    return Math.max(-1, Math.min(1, sentiment / Math.max(1, words.length / 10)));
  }

  private getEmotionalWeight(word: string): number {
    const positiveWord = this.positiveWords.find(w => word.includes(w.word));
    if (positiveWord) return positiveWord.weight;

    const negativeWord = this.negativeWords.find(w => word.includes(w.word));
    if (negativeWord) return negativeWord.weight;

    return 0;
  }

  private getEmotionalContext(sentiment: number): string {
    if (sentiment > 0.5) return 'very_positive';
    if (sentiment > 0.2) return 'positive';
    if (sentiment < -0.5) return 'very_negative';
    if (sentiment < -0.2) return 'negative';
    return 'neutral';
  }
}