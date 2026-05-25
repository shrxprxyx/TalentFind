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
  Loader2,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const quickActions = [
  { label: "Post a Project", href: "/projects/new", icon: Plus, accent: true },
  { label: "Browse Projects", href: "/projects", icon: Briefcase, accent: false },
  { label: "My Portfolio", href: "/portfolio", icon: Star, accent: false },
  { label: "My Proposals", href: "/proposals", icon: FileText, accent: false },
];

const ROLES = [
  { key: "FREELANCER", label: "Freelancer", desc: "I offer services" },
  { key: "CLIENT", label: "Client", desc: "I hire talent" },
  { key: "BOTH", label: "Both", desc: "I do both" },
] as const;

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card className="bg-card border-border/60 hover:border-amber-500/20 transition-colors duration-300">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          {loading ? (
            <div className="h-8 w-12 bg-secondary animate-pulse rounded" />
          ) : (
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {value}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({ userName, userImage, userEmail }: Props) {
  const firstName = userName.split(" ")[0];
  const { data, loading, error, updateRole } = useDashboard();

  const role = data?.user?.role;
  const stats = data?.stats;
  const recentProposals = data?.recentProposals ?? [];
  const recentProjects = data?.recentProjects ?? [];

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
            {role && (
              <Badge
                variant="outline"
                className="border-amber-500/30 text-amber-400 bg-amber-500/5 text-xs tracking-widest uppercase hidden sm:flex"
              >
                {role}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-9 h-9 ring-2 ring-amber-500/30" },
              }}
            />
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          {/* Welcome */}
          <motion.div variants={item} className="flex flex-col gap-2">
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

          {/* Role selection — only shown if role not set */}
          {!loading && !role && (
            <motion.div variants={item}>
              <Card className="bg-card border-amber-500/30">
                <CardHeader>
                  <CardTitle
                    className="text-lg flex items-center gap-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Set your role to get started
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Tell us how you'll use TalentStage so we can personalise your experience.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLES.map(({ key, label, desc }) => (
                      <button
                        key={key}
                        onClick={() => updateRole(key)}
                        className="group flex flex-col items-start gap-1 p-4 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-200 text-left"
                      >
                        <span className="font-semibold text-sm group-hover:text-amber-400 transition-colors">
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Role set confirmation */}
          {!loading && role && (
            <motion.div variants={item}>
              <div className="flex items-center gap-2 text-sm text-amber-400/80">
                <CheckCircle2 className="w-4 h-4" />
                You're set up as a{" "}
                <span className="font-semibold capitalize">{role.toLowerCase()}</span>.
                <button
                  onClick={() => {/* open role change UI */}}
                  className="text-muted-foreground hover:text-amber-400 underline underline-offset-2 ml-1 transition-colors"
                >
                  Change
                </button>
              </div>
            </motion.div>
          )}

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
              <StatCard label="Active Projects" value={stats?.activeProjects ?? 0} icon={Briefcase} loading={loading} />
              <StatCard label="Proposals Sent" value={stats?.proposalsSent ?? 0} icon={FileText} loading={loading} />
              <StatCard label="Portfolio Items" value={stats?.portfolioItems ?? 0} icon={Star} loading={loading} />
              <StatCard label="Profile Views" value={stats?.profileViews ?? 0} icon={TrendingUp} loading={loading} />
            </div>
          </motion.div>

          {/* Recent Projects (if client/both) */}
          {(role === "CLIENT" || role === "BOTH") && (
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                  Your Projects
                </h2>
                <Link href="/projects/new">
                  <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 text-xs gap-1">
                    <Plus className="w-3 h-3" /> New Project
                  </Button>
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <Card className="bg-card border-border/60">
                  <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                    <FolderOpen className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No projects yet.</p>
                    <Link href="/projects/new">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full">
                        Post your first project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentProjects.map((project) => (
                    <Card key={project.id} className="bg-card border-border/60 hover:border-amber-500/20 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-medium text-sm truncate">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ${project.budget} budget · {project.proposals.length} proposals ·{" "}
                            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Link href={`/projects/${project.id}`}>
                          <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 shrink-0">
                            View <ArrowRight className="ml-1 w-3 h-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  <Link href="/projects" className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors text-center mt-1">
                    View all projects →
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Proposals received (client) */}
          {(role === "CLIENT" || role === "BOTH") && recentProposals.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Recent Proposals
              </h2>
              <div className="flex flex-col gap-3">
                {recentProposals.map((proposal) => (
                  <Card key={proposal.id} className="bg-card border-border/60 hover:border-amber-500/20 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={proposal.freelancer.image} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs">
                          {proposal.freelancer.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <p className="font-medium text-sm">{proposal.freelancer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          on <span className="text-foreground/70">{proposal.project.title}</span> ·{" "}
                          ${proposal.bidAmount} · {proposal.timeline}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Feature teaser */}
          <motion.div variants={item}>
            <Card className="border-amber-500/20 overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, hsla(40,85%,58%,0.08), transparent)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Smart Freelancer Match
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Post a project and AI will rank the top 5 matching freelancers for you.
                    </p>
                  </div>
                </div>
                <Link href="/projects/new">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-full shrink-0 group">
                    Try it
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}