import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-primary-bg flex flex-col items-center justify-center z-50">
      <motion.div 
        className="relative w-32 h-32 mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-accent rounded-2xl animate-ping-slow opacity-20"></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <svg 
            className="w-20 h-20 text-accent" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>
      
      <motion.h1 
        className="text-2xl font-bold text-text-primary mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Blackjack Pro
      </motion.h1>
      
      <motion.p 
        className="text-text-secondary mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Loading your experience...
      </motion.p>
      
      <motion.div 
        className="w-64 h-2 bg-tertiary-bg rounded-full overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div 
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}
