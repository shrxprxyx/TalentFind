"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Loader2,
  Send,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  deadline: string;
  projectType: "FIXED" | "HOURLY";
  createdAt: string;
  client: { name: string; image: string; email: string };
  proposals: {
    id: string;
    bidAmount: number;
    timeline: string;
    coverLetter: string;
    createdAt: string;
    freelancer: { name: string; image: string };
  }[];
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [proposalError, setProposalError] = useState("");

  const [proposal, setProposal] = useState({
    bidAmount: "",
    timeline: "",
    coverLetter: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`
        );
        setProject(res.data);
      } catch {
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const submitProposal = async () => {
    if (!proposal.bidAmount || !proposal.timeline || !proposal.coverLetter) {
      setProposalError("Please fill in all fields.");
      return;
    }
    try {
      setSubmitting(true);
      setProposalError("");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals`,
        { ...proposal, projectId: id },
        { headers: { Authorization: token! } }
      );
      setSubmitted(true);
      setShowProposalForm(false);
      // Refresh project to show updated proposal count
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`);
      setProject(res.data);
    } catch (err: any) {
      setProposalError(err?.response?.data?.error || "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col gap-8"
        >
          {/* Back */}
          <motion.div variants={item}>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> All Projects
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Title card */}
              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <h1
                        className="text-3xl font-bold leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {project.title}
                      </h1>
                      <Badge variant="outline" className="border-border text-muted-foreground shrink-0 mt-1">
                        {project.projectType}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="text-foreground font-medium">${project.budget.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        Due {format(new Date(project.deadline), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-400" />
                        {project.proposals.length} proposal{project.proposals.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>

                    {project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((s) => (
                          <Badge key={s} variant="outline" className="border-amber-500/25 text-amber-400/80 bg-amber-500/5 text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Proposal */}
              <motion.div variants={item}>
                {submitted ? (
                  <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Your proposal was submitted successfully!
                  </div>
                ) : showProposalForm ? (
                  <Card className="bg-card border-amber-500/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Submit a Proposal
                        </CardTitle>
                        <button
                          onClick={() => setShowProposalForm(false)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {proposalError && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {proposalError}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">Bid Amount (USD)</label>
                          <input
                            type="number"
                            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                            placeholder="e.g. 450"
                            value={proposal.bidAmount}
                            onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">Timeline</label>
                          <input
                            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                            placeholder="e.g. 2 weeks"
                            value={proposal.timeline}
                            onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Cover Letter</label>
                        <textarea
                          rows={5}
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                          placeholder="Introduce yourself and explain why you're the best fit..."
                          value={proposal.coverLetter}
                          onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={submitProposal}
                        disabled={submitting}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full self-end px-6"
                      >
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4 mr-2" /> Submit Proposal</>}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    onClick={() => setShowProposalForm(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl py-3 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.35)] transition-all duration-300"
                  >
                    <Send className="w-4 h-4 mr-2" /> Submit a Proposal
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Client info */}
              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Posted by</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.client.image} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-400">
                          {project.client.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{project.client.name}</p>
                        <p className="text-xs text-muted-foreground">{project.client.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Proposals list (visible to client) */}
              {project.proposals.length > 0 && (
                <motion.div variants={item}>
                  <Card className="bg-card border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Proposals ({project.proposals.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 pt-0">
                      {project.proposals.map((p) => (
                        <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={p.freelancer.image} />
                            <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs">
                              {p.freelancer.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="text-sm font-medium">{p.freelancer.name}</p>
                            <p className="text-xs text-amber-400">${p.bidAmount} · {p.timeline}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{p.coverLetter}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}