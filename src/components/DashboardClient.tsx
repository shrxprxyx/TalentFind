"use client";

import { motion, Variants } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Props {
  userName: string;
  userImage: string;
  userEmail: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const},
  },
};

const quickActions = [
  { label: "Post a Project", href: "/projects/new", icon: Plus, accent: true },
  { label: "Browse Projects", href: "/projects", icon: Briefcase, accent: false },
  { label: "My Portfolio", href: "/portfolio", icon: Star, accent: false },
  { label: "My Proposals", href: "/proposals", icon: FileText, accent: false },
];

const stats = [
  { label: "Active Projects", value: "—", icon: Briefcase },
  { label: "Proposals Sent", value: "—", icon: FileText },
  { label: "Profile Views", value: "—", icon: TrendingUp },
  { label: "Avg Rating", value: "—", icon: Star },
];

export default function DashboardClient({ userName, userImage, userEmail }: Props) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen relative">
      {/* Topbar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span
              className="text-xl font-bold text-amber-400 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              TalentStage
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-amber-500/30",
                },
              }}
            />
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          {/* Welcome */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className="w-fit border-amber-500/30 text-amber-400 bg-amber-500/5 text-xs tracking-widest uppercase"
            >
              Dashboard
            </Badge>
            <h1
              className="text-5xl font-bold mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome back,{" "}
              <span className="italic text-amber-400">{firstName}.</span>
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening on your stage today.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map(({ label, href, icon: Icon, accent }) => (
                <Link key={label} href={href}>
                  <Button
                    variant={accent ? "default" : "outline"}
                    className={`w-full h-auto py-4 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 ${
                      accent
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.35)]"
                        : "border-border hover:border-amber-500/40 hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item}>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <Card
                  key={label}
                  className="bg-card border-border/60 hover:border-amber-500/20 transition-colors duration-300"
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* AI Feature teaser */}
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-amber-500/8 to-transparent border-amber-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-foreground"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Smart Freelancer Match
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Post a project and AI will rank the top 5 matching freelancers for you.
                    </p>
                  </div>
                </div>
                <Link href="/projects/new">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-full shrink-0 group"
                  >
                    Try it
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role selection prompt */}
          <motion.div variants={item}>
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle
                  className="text-lg"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Complete your profile
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Tell us how you'll use TalentStage so we can personalise your experience.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {["Freelancer", "Client", "Both"].map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      className="border-border hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-400 rounded-full transition-all duration-200"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}