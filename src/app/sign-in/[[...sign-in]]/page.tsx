"use client";

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(40,85%,58%) 1px, transparent 1px), linear-gradient(90deg, hsl(40,85%,58%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <a href="/" className="text-2xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
          TalentStage
        </a>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: 'hsl(40, 85%, 58%)',
              colorBackground: 'hsl(222, 18%, 11%)',
              colorText: 'hsl(40, 15%, 92%)',
              colorTextSecondary: 'hsl(220, 10%, 55%)',
              colorInputBackground: 'hsl(222, 14%, 16%)',
              colorInputText: 'hsl(40, 15%, 92%)',
              borderRadius: '10px',
              fontFamily: 'DM Sans, sans-serif',
            },
            elements: {
              card: 'shadow-2xl border border-white/5',
              formButtonPrimary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold',
            },
          }}
        />
      </motion.div>
    </div>
  )
}