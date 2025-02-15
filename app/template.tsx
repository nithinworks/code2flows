"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "./components/BackgroundGradient";
import { GridPattern } from "./components/GridPattern";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative min-h-screen"
      >
        <div className="absolute inset-0 pointer-events-none">
          <BackgroundGradient />
          <GridPattern />
        </div>
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
