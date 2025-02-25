import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

/**
 * ローディングインジケーターコンポーネント
 * AIが応答を生成している間、アニメーションする点を表示してユーザーに視覚的なフィードバックを提供します。
 */
export function LoadingIndicator() {
  // ドットのアニメーション設定
  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  // 全体のフェードアニメーション設定
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // ペルソナに応じた色を設定できるようにする場合は、propsで受け取る
  const dotColor = "bg-indigo-400";

  return (
    <motion.div 
      className="flex items-center space-x-2"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <Avatar className="w-8 h-8 bg-indigo-100" />
      <div className="bg-white border border-indigo-100 rounded-full px-4 py-2 shadow-sm">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className={`w-2 h-2 ${dotColor} rounded-full`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}