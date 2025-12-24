"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const WaveBackground = ({ children }: { children: React.ReactNode }) => {
  // Prevent hydration mismatch by only rendering animated content after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full">
      <div className="relative w-full h-screen bg-white dark:bg-black overflow-hidden font-sans transition-colors duration-700">
        <div>
          <div className="relative z-10 flex flex-col h-full items-center justify-center gap-6">
            {children}
          </div>
          {mounted && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <div
                className="absolute bottom-[-30%] left-[-20%] w-[150%] h-[60%] rounded-[100%] blur-[140px]
                          bg-cyan-200 dark:bg-blue-950 transition-colors duration-700
                          animate-wave-slow"
              />
              <div
                className="absolute bottom-[-35%] right-[-10%] w-[130%] h-[60%] rounded-[100%] blur-[130px]
                          bg-purple-200 dark:bg-blue-900/80 transition-colors duration-700
                          animate-wave-slower [animation-delay:-5s]"
              />
              <div
                className="absolute bottom-[-40%] right-[10%] w-[90%] h-[50%] rounded-[100%] blur-[120px]
                          bg-blue-300/60 dark:bg-blue-600/50 transition-colors duration-700
                          animate-wave-pulse [animation-delay:-2s]"
              />
              <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05] z-[1]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaveBackground;
