"use client";

import { FC, ReactNode, useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils"; // Adjust this import if `cn` is defined elsewhere.

const AnimatedBackground = () => {
  const circles = [
    { size: 80, left: "25%", delay: 0, duration: 25 },
    { size: 20, left: "10%", delay: 2, duration: 12 },
    { size: 20, left: "70%", delay: 4, duration: 25 },
    { size: 60, left: "40%", delay: 0, duration: 18 },
    { size: 20, left: "65%", delay: 0, duration: 25 },
    { size: 110, left: "75%", delay: 3, duration: 25 },
    { size: 150, left: "35%", delay: 7, duration: 25 },
    { size: 25, left: "50%", delay: 15, duration: 45 },
    { size: 15, left: "20%", delay: 2, duration: 35 },
    { size: 150, left: "85%", delay: 0, duration: 11 },
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className="absolute bg-white bg-opacity-20 rounded-full"
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            left: circle.left,
            bottom: "-150px",
          }}
          initial={{
            opacity: 1,
            y: 0,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            y: "-1000px",
            rotate: 720,
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        ></motion.div>
      ))}
    </div>
  );
};

export const TextRevealByWord: FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <AnimatedBackground />
      <div className="sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]">
        <p className="flex flex-wrap p-5 text-2xl font-bold text-green/50 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

const Word: FC<{
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-2.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        style={{ opacity }}
        className="text-green-600 dark:text-white"
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextRevealByWord;
