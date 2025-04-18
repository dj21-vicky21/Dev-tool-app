"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* 404 Number */}
        <motion.h1 
          className="text-9xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2
          }}
        >
          404
        </motion.h1>

        {/* Divider */}
        <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
        
        {/* Message */}
        <div className="space-y-2">
          <motion.h2 
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Oops! Page not found
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            The page you are looking for doesn&apos;t exist or has been moved.
          </motion.p>
        </div>
        
        {/* Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Background Elements - Animated Shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-20 blur-3xl"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-r from-pink-300 to-red-300 opacity-20 blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}

export default NotFound;
