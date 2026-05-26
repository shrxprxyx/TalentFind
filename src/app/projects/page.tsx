"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  Search,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  deadline: string;
  projectType: "FIXED" | "HOURLY";
  createdAt: string;
  client: { name: string; image: string };
  proposals: { id: string }[];
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function BrowseProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "FIXED" | "HOURLY">("");
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
        { params }
      );
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const clearFilters = () => {
    setTypeFilter("");
    setMinBudget("");
    setMaxBudget("");
    setSearch("");
  };

  const hasFilters = search || typeFilter || minBudget || maxBudget;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Browse <span className="italic text-amber-400">Projects</span>
            </h1>
            <p className="text-muted-foreground">Find your next opportunity.</p>
          </motion.div>

          {/* Search + Filter bar */}
          <motion.div variants={item} className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="Search projects by title or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 font-semibold rounded-xl px-5"
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl border-border cursor-pointer hover:border-amber-500/40 gap-2 ${showFilters ? "border-amber-500/40 text-amber-400" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </form>

            {/* Filters panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-4 p-4 bg-card border border-border/60 rounded-xl"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Type</label>
                  <div className="flex gap-2">
                    {(["", "FIXED", "HOURLY"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          typeFilter === t
                            ? "bg-amber-500/10 cursor-pointer border-amber-500/50 text-amber-400"
                            : "border-border cursor-pointer text-muted-foreground hover:border-amber-500/30"
                        }`}
                      >
                        {t === "" ? "All" : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Budget Range (USD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-24 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500/50"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                    <span className="text-muted-foreground text-xs">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-24 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500/50"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                    <Button size="sm" onClick={fetchProjects} className="bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 rounded-lg">
                      Apply
                    </Button>
                  </div>
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground cursor-pointer hover:text-red-400 flex items-center gap-1 transition-colors self-end pb-0.5"
                  >
                    <X className="w-3 h-3 " /> Clear all
                  </button>
                )}
              </motion.div>
            )}

            {/* Active filter chips */}
            {hasFilters && !showFilters && (
              <div className="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1 text-xs">
                    "{search}"
                    <button onClick={() => { setSearch(""); fetchProjects(); }}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {typeFilter && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1 text-xs">
                    {typeFilter}
                    <button onClick={() => setTypeFilter("")}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Results count */}
          {!loading && (
            <motion.p variants={item} className="text-sm text-muted-foreground -mt-4">
              {projects.length} project{projects.length !== 1 ? "s" : ""} found
            </motion.p>
          )}

          {/* Project list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <motion.div variants={item} className="text-center py-20">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No projects found.</p>
              <Link href="/projects/new">
                <Button size="sm" className="mt-4 cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full">
                  Post the first one
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
              {projects.map((project) => (
                <motion.div key={project.id} variants={item}>
                  <Link href={`/projects/${project.id}`}>
                    <Card className="bg-card border-border/60 hover:border-amber-500/25 transition-all duration-300 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.06)] group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className="font-semibold text-lg group-hover:text-amber-400 transition-colors"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {project.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs border-border text-muted-foreground"
                              >
                                {project.projectType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                            {project.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {project.skills.slice(0, 5).map((s) => (
                                  <Badge
                                    key={s}
                                    variant="outline"
                                    className="text-xs border-amber-500/20 text-amber-400/70 bg-amber-500/5"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                                {project.skills.length > 5 && (
                                  <span className="text-xs text-muted-foreground">+{project.skills.length - 5}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${project.budget.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.proposals.length} proposal{project.proposals.length !== 1 ? "s" : ""}
                              </span>
                              <span>by {project.client.name}</span>
                              <span>posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}