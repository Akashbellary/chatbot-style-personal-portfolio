"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        fixed top-4 right-4 z-[60] flex h-12 w-24 items-center rounded-full p-1 transition-colors duration-300 shadow-lg
        ${isDark 
          ? "bg-gray-800 border border-gray-600" 
          : "bg-gray-200 border border-gray-300"
        }
      `}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Sliding background */}
      <motion.div
        className={`
          absolute h-10 w-10 rounded-full transition-colors duration-300
          ${isDark ? "bg-gray-700" : "bg-white"}
        `}
        animate={{
          x: isDark ? 48 : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      />
      
      {/* Sun icon */}
      <div className="relative z-10 flex h-10 w-10 items-center justify-center">
        <Sun 
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-yellow-500"
          }`} 
        />
      </div>
      
      {/* Moon icon */}
      <div className="relative z-10 flex h-10 w-10 items-center justify-center">
        <Moon 
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-blue-400" : "text-gray-400"
          }`} 
        />
      </div>
    </motion.button>
  );
}