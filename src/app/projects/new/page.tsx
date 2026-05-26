"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { X, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function NewProjectPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    projectType: "FIXED",
  });
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
        { ...form, skills },
        { headers: { Authorization: token! } }
      );
      router.push("/projects");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to post project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-fit -ml-2 mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Post a <span className="italic text-amber-400">Project</span>
            </h1>
            <p className="text-muted-foreground">Fill in the details and find your perfect freelancer.</p>
          </motion.div>

          {error && (
            <motion.div variants={item} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Title <span className="text-red-400">*</span></label>
                  <input
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="e.g. Build a React dashboard"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Description <span className="text-red-400">*</span></label>
                  <textarea
                    rows={5}
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    placeholder="Describe the project scope, deliverables, and any requirements..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Budget + Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Budget (USD) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="500"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Project Type</label>
                    <div className="flex gap-2 h-full items-end pb-0.5">
                      {["FIXED", "HOURLY"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, projectType: type })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                            form.projectType === type
                              ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                              : "border-border text-muted-foreground hover:border-amber-500/30"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Deadline <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Required Skills</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="e.g. React, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addSkill}
                      className="border-border hover:border-amber-500/40 hover:text-amber-400"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {skills.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1"
                        >
                          {s}
                          <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_24px_hsla(40,85%,58%,0.4)]"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</> : "Post Project"}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}