"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
      onAnimationComplete={() => document.body.style.overflow = "unset"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: 2,
          repeatType: "reverse"
        }}
        className="text-center"
      >
        <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-primary"
        >
          Hope Foundation
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}