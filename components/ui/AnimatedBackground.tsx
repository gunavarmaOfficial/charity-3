import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import HeroVideoDialog from "./hero-video-dialog";

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
    <div className="relative flex items-center justify-center w-full h-screen bg-gradient-to-l from-[#16A249] to-[#1f6d17]">
      {/* Text */}
      <div className="absolute top-1/2 flex flex-col gap-10 justify-center items-center z-10 transform -translate-y-1/2">
        <span className="text-white text-center flex flex-col px-4 gap-2  ">
          <span className="text-4xl drop-shadow-lg md:text-5xl  font-bold ">
            Welcome to Sri Viswa Charitable Trust
          </span>
          <span className="text-md">
            a beacon of hope for underprivileged communities in India.
          </span>
        </span>

        <HeroVideoDialog
          className="md:h-[40%] md:w-[40%] px-10 z-50  "
          animationStyle="from-center"
          videoSrc="https://www.youtube.com/watch?v=E4XKY-ISKdU"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
      </div>

      {/* Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
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
    </div>
  );
};

export default AnimatedBackground;
