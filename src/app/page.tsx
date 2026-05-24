"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Briefcase } from "lucide-react";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const},
  }),
};


export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(40,85%,58%) 1px, transparent 1px), linear-gradient(90deg, hsl(40,85%,58%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">

        {/* Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your talent,{" "}
          <span className="italic text-amber-400">centre</span>
          <br />
          stage.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light"
        >
          A marketplace where creative and technical freelancers get discovered by clients —
          with AI helping both sides make better decisions.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex items-center gap-4 mt-2"
        >
          {!isSignedIn ? (
            <>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 font-semibold px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_24px_hsla(40,85%,58%,0.4)] group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-muted-foreground cursor-pointer hover:text-foreground rounded-full px-8 border border-border hover:border-amber-500/40 transition-all duration-300"
                >
                  Sign In
                </Button>
              </SignInButton>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_24px_hsla(40,85%,58%,0.4)] group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-amber-500/30",
                  },
                }}
              />
            </div>
          )}
        </motion.div>

      </div>

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-amber-500/20 rounded-tl-sm" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-amber-500/20 rounded-br-sm" />
    </main>
  );
}