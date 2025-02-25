# おふくろAI (Nandemo Kaachan)

母親のような温かみのあるAIチャットボットと日常生活に関するやり取りを行う。

https://ai-mom.vercel.app/

## 特徴

- **3つのペルソナ**
  - 優しいかあちゃん: 優しく励ましてくれる
  - スパルタかあちゃん: 的確なアドバイスと愛情深い指導
  - 楽しいかあちゃん: ユーモアを交えた楽しい会話

- **便利な機能**
  - 文脈を理解した自然な会話
  - スマートフォン対応のレスポンシブデザイン
  - メッセージの履歴表示
  - リアルタイムの入力チェック
  - タイピング中のインジケーター表示

## 技術スタック

- Frontend: React, TypeScript
- UI: Tailwind CSS, shadcn/ui
- アニメーション: Framer Motion
- AI: Google Gemini API

## ローカル開発

1. リポジトリをクローン
```bash
git clone git@github.com:Bluefinee/ai-mom.git
cd ai-mom
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env.local` に必要な環境変数を設定:
- `GOOGLE_API_KEY`: Google Gemini API キー

4. 開発サーバーを起動
```bash
npm run dev
```