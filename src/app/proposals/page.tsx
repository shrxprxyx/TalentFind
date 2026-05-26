"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  FileText,
  Loader2,
  DollarSign,
  Clock,
  Calendar,
  ArrowRight,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface Proposal {
  id: string;
  bidAmount: number;
  timeline: string;
  coverLetter: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    budget: number;
    deadline: string;
    projectType: string;
    client: { name: string; image: string };
  };
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function MyProposalsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/my`,
        { headers: { Authorization: token! } }
      );
      setProposals(res.data);
    } catch {
      setError("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchProposals();
  }, [isLoaded, isSignedIn]);

  const handleWithdraw = async (id: string) => {
    try {
      setDeletingId(id);
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${id}`,
        { headers: { Authorization: token! } }
      );
      setProposals(proposals.filter((p) => p.id !== id));
    } catch {
      setError("Failed to withdraw proposal.");
    } finally {
      setDeletingId(null);
    }
  };

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
          {/* Header */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              My <span className="italic text-amber-400">Proposals</span>
            </h1>
            <p className="text-muted-foreground">Track all the proposals you've submitted.</p>
          </motion.div>

          {error && (
            <motion.div variants={item} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          {/* Stats strip */}
          {!loading && proposals.length > 0 && (
            <motion.div variants={item} className="flex gap-6 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {proposals.length}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Sent</span>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${Math.round(proposals.reduce((acc, p) => acc + p.bidAmount, 0) / proposals.length).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Bid</span>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${proposals.reduce((acc, p) => acc + p.bidAmount, 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Bid Value</span>
              </div>
            </motion.div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : proposals.length === 0 ? (
            <motion.div variants={item} className="text-center py-20">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">You haven't submitted any proposals yet.</p>
              <Link href="/projects">
                <Button size="sm" className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full">
                  Browse Projects
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
              {proposals.map((proposal) => (
                <motion.div key={proposal.id} variants={item} layout>
                  <Card className="bg-card border-border/60 hover:border-amber-500/20 transition-colors duration-300">
                    <CardContent className="p-5 flex flex-col gap-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                            <AvatarImage src={proposal.project.client.image} />
                            <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs">
                              {proposal.project.client.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <Link href={`/projects/${proposal.project.id}`}>
                              <h3
                                className="font-semibold text-base hover:text-amber-400 transition-colors cursor-pointer leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {proposal.project.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              by {proposal.project.client.name} ·{" "}
                              <Badge variant="outline" className="text-xs border-border text-muted-foreground py-0 px-1.5">
                                {proposal.project.projectType}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/projects/${proposal.project.id}`}>
                            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-amber-400 h-8 px-2">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWithdraw(proposal.id)}
                            disabled={deletingId === proposal.id}
                            className="text-muted-foreground hover:text-red-400 h-8 px-2 transition-colors"
                          >
                            {deletingId === proposal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-foreground font-medium">${proposal.bidAmount.toLocaleString()}</span> bid
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {proposal.timeline}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Project due {format(new Date(proposal.project.deadline), "MMM d, yyyy")}
                        </span>
                        <span className="ml-auto">
                          Submitted {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Cover letter expand */}
                      <div>
                        <button
                          onClick={() => setExpandedId(expandedId === proposal.id ? null : proposal.id)}
                          className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                        >
                          {expandedId === proposal.id ? "Hide cover letter ↑" : "View cover letter ↓"}
                        </button>
                        <AnimatePresence>
                          {expandedId === proposal.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed border-l-2 border-amber-500/20 pl-3">
                                {proposal.coverLetter}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}