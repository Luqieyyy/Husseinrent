"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function AnimatedLogo() {
  return (
    <Link 
      href="/" 
      // ADDED 'w-full' here so the container doesn't collapse
      className="relative z-10 flex justify-center w-full" 
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        
        // Container sizing
        className="relative h-40 md:h-60 w-full max-w-[500px] md:max-w-[700px]"
      >
        <motion.div
           animate={{ y: [0, -15, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
           className="relative w-full h-full"
        >
          <Image 
            src="/logo.png" 
            alt="HusseinRent"
            fill
            className="object-contain drop-shadow-2xl"
            priority 
          />
        </motion.div>
      </motion.div>
    </Link>
  );
}