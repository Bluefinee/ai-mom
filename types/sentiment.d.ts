declare module 'sentiment' {
    namespace Sentiment {
      interface AnalysisResult {
        score: number;
        comparative: number;
        calculation: Array<{[token: string]: number}>;
        tokens: string[];
        words: string[];
        positive: string[];
        negative: string[];
      }
    }
  
    class Sentiment {
      analyze(phrase: string, options?: Record<string, unknown>): Sentiment.AnalysisResult;
    }
  
    export = Sentiment;
  }