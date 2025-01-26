// LoadingIndicator.tsx

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

/**
 * ローディングインジケーターコンポーネント
 * AIが応答を生成している間、アニメーションする点を表示してユーザーに視覚的なフィードバックを提供します。
 */
export function LoadingIndicator() {
  // ドットのアニメーション設定
  const dotVariants = {
    animate: {
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 0.6
      }
    }
  };

  // 全体のフェードアニメーション設定
  const containerVariants = {
    initial: { opacity: 0.5 },
    animate: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="w-8 h-8 bg-pink-200" />
      <div className="bg-gray-100 rounded-full px-4 py-2">
        <motion.div 
          className="flex space-x-1"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* 3つのドットをそれぞれ異なるディレイでアニメーション */}
          {[0, 0.2, 0.4].map((delay, index) => (
            <motion.span
              key={index}
              variants={dotVariants}
              animate="animate"
              style={{ display: 'inline-block' }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: delay
              }}
              className="text-pink-500"
            >
              ●
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}