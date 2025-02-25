import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface OnboardingProps {
  onComplete: (userName: string, selectedPersona: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");

  const steps = [
    // ウェルカム画面
    <motion.div 
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-6 p-8 max-w-md mx-auto text-center"
    >
      <div className="w-32 h-32 rounded-full bg-pink-200 overflow-hidden relative">
        <Image 
          src="/images/japanese-mom.jpg" 
          alt="なんでもかあちゃん" 
          width={128}
          height={128}
          className="object-cover"
        />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        なんでもかあちゃんへようこそ！
      </h1>
      <p className="text-gray-600">
        かあちゃんと気軽におしゃべりしましょう。日常のちょっとした相談から、家事の知恵袋まで、なんでも聞いてくださいね。
      </p>
      <Button
        onClick={() => setStep(1)}
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-2"
      >
        はじめる
      </Button>
    </motion.div>,

    // 名前入力
    <motion.div
      key="name"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center space-y-6 p-8 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-pink-600">お名前を教えてください</h2>
      <p className="text-gray-600">
        かあちゃんはあなたのことをなんて呼べばいいかしら？
      </p>
      <div className="w-full max-w-xs">
        <Input
          type="text"
          placeholder="お名前（ニックネームでも可）"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border-pink-300 focus:border-pink-500"
        />
      </div>
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep(0)}
        >
          戻る
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={!userName.trim()}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          次へ
        </Button>
      </div>
    </motion.div>,

    // ペルソナ選択
    <motion.div
      key="persona"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center space-y-6 p-8 max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-pink-600">かあちゃんを選んでください</h2>
      <p className="text-gray-600">
        あなたに合ったかあちゃんはどのタイプ？
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedPersona === "caring" 
              ? "border-pink-500 bg-pink-50" 
              : "border-gray-200 hover:border-pink-300"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedPersona("caring")}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-pink-200 overflow-hidden relative mb-3">
            <Image 
              src="/images/japanese-mom.jpg" 
              alt="思いやりのあるかあちゃん" 
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h3 className="font-bold text-center text-pink-600">思いやりのある母</h3>
          <p className="text-sm text-center text-gray-500 mt-2">
            優しくて温かい。悩みを親身になって聞いてくれる、包み込むような優しさのかあちゃん。
          </p>
          <div className="mt-3 bg-pink-100 rounded p-2 text-xs text-pink-700">
            <p>「大丈夫よ、ゆっくり話してごらん？かあちゃんはいつでもあなたの味方だからね」</p>
          </div>
        </motion.div>

        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedPersona === "strict" 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-200 hover:border-blue-300"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedPersona("strict")}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-200 overflow-hidden relative mb-3">
            <Image 
              src="/images/japanese-mom.jpg" 
              alt="厳しいかあちゃん" 
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h3 className="font-bold text-center text-blue-600">厳しい母</h3>
          <p className="text-sm text-center text-gray-500 mt-2">
            的確なアドバイスでサポート。時に厳しいけれど、愛情に満ちた頼れるかあちゃん。
          </p>
          <div className="mt-3 bg-blue-100 rounded p-2 text-xs text-blue-700">
            <p>「甘えてばかりじゃダメよ。でもね、あなたならできるって信じてるからね」</p>
          </div>
        </motion.div>

        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedPersona === "fun" 
              ? "border-yellow-500 bg-yellow-50" 
              : "border-gray-200 hover:border-yellow-300"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedPersona("fun")}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-yellow-200 overflow-hidden relative mb-3">
            <Image 
              src="/images/japanese-mom.jpg" 
              alt="楽しいかあちゃん" 
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h3 className="font-bold text-center text-yellow-600">楽しい母</h3>
          <p className="text-sm text-center text-gray-500 mt-2">
            いつも明るく前向き。笑顔とユーモアで毎日を楽しくしてくれるかあちゃん。
          </p>
          <div className="mt-3 bg-yellow-100 rounded p-2 text-xs text-yellow-700">
            <p>「何でも楽しくやっていきましょ！人生一度きり、笑顔が一番よ♪」</p>
          </div>
        </motion.div>
      </div>

      <div className="flex space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
        >
          戻る
        </Button>
        <Button
          onClick={() => onComplete(userName, selectedPersona)}
          disabled={!selectedPersona}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          かあちゃんに会いに行く
        </Button>
      </div>
    </motion.div>
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-green-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}