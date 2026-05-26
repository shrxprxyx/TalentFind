"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { useDashboard } from "@/lib/hooks/useDashboard";
import axios from "axios";
import {
  ArrowLeft, Clock, DollarSign, Users, Calendar,
  Loader2, Send, X, CheckCircle2, Check,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface Proposal {
  id: string;
  bidAmount: number;
  timeline: string;
  coverLetter: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  freelancer: { name: string; image: string };
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  deadline: string;
  projectType: "FIXED" | "HOURLY";
  createdAt: string;
  clientId: string;
  client: { name: string; image: string; email: string };
  proposals: Proposal[];
}

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const statusColors: Record<string, string> = {
  PENDING: "border-border text-muted-foreground",
  ACCEPTED: "border-green-500/40 text-green-400 bg-green-500/5",
  REJECTED: "border-red-500/40 text-red-400 bg-red-500/5",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { data: dashData } = useDashboard();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState("");
  const [proposal, setProposal] = useState({ bidAmount: "", timeline: "", coverLetter: "" });

  const fetchProject = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`);
      setProject(res.data);
    } catch (err: any) {
      // Only redirect on 404, not on every error
      if (err?.response?.status === 404) {
        router.push("/projects");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
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
      setShowForm(false);
      await fetchProject();
    } catch (err: any) {
      setProposalError(err?.response?.data?.error || "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptProposal = async (proposalId: string) => {
    try {
      setAcceptingId(proposalId);
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalId}/accept`,
        {},
        { headers: { Authorization: token! } }
      );
      await fetchProject();
    } catch (err) {
      console.error("Failed to accept", err);
    } finally {
      setAcceptingId(null);
    }
  };

  // Compute permissions after both loads complete
  const dashLoaded = !!dashData?.user?.id;
  const isProjectOwner = dashLoaded && project !== null && dashData!.user.id === project.clientId;
  const isClient = isProjectOwner;
  const isFreelancer = dashLoaded && !isProjectOwner;
  const hasAccepted = project?.proposals.some((p) => p.status === "ACCEPTED") ?? false;

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

  if (!project) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <p className="text-muted-foreground text-sm">Project not found or failed to load.</p>
        <button onClick={() => router.push("/projects")} className="text-amber-400 text-sm underline">
          Back to projects
        </button>
      </div>
    </div>
  );

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
          <motion.div variants={fadeItem}>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> All Projects
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Project info */}
              <motion.div variants={fadeItem}>
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

              {/* Proposal form — freelancers only */}
              {isFreelancer && (
                <motion.div variants={fadeItem}>
                  {submitted ? (
                    <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4" />
                      Your proposal was submitted successfully!
                    </div>
                  ) : showForm ? (
                    <Card className="bg-card border-amber-500/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Submit a Proposal
                          </CardTitle>
                          <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
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
                          {submitting
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            : <><Send className="w-4 h-4 mr-2" /> Submit Proposal</>
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl py-3 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.35)] transition-all duration-300"
                    >
                      <Send className="w-4 h-4 mr-2" /> Submit a Proposal
                    </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Posted by */}
              <motion.div variants={fadeItem}>
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

              {/* Proposals list */}
              {project.proposals.length > 0 && (
                <motion.div variants={fadeItem}>
                  <Card className="bg-card border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Proposals ({project.proposals.length})
                        {hasAccepted && (
                          <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/5 text-xs font-normal">
                            Hired
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 pt-0">
                      {project.proposals.map((p) => (
                        <div
                          key={p.id}
                          className={`flex flex-col gap-2 pb-3 border-b border-border/40 last:border-0 last:pb-0 ${p.status === "REJECTED" ? "opacity-40" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 shrink-0">
                              <AvatarImage src={p.freelancer.image} />
                              <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs">
                                {p.freelancer.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">{p.freelancer.name}</p>
                                <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[p.status]}`}>
                                  {p.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-amber-400">${p.bidAmount} · {p.timeline}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{p.coverLetter}</p>
                            </div>
                          </div>

                          {isClient && p.status === "PENDING" && !hasAccepted && (
                            <Button
                              size="sm"
                              onClick={() => acceptProposal(p.id)}
                              disabled={acceptingId === p.id}
                              className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 hover:border-green-500/50 rounded-lg text-xs font-medium transition-all duration-200"
                            >
                              {acceptingId === p.id
                                ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Accepting...</>
                                : <><Check className="w-3 h-3 mr-1.5" /> Accept this Proposal</>
                              }
                            </Button>
                          )}

                          {p.status === "ACCEPTED" && (
                            <div className="flex items-center gap-1.5 text-xs text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                            </div>
                          )}
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