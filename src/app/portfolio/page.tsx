"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  Plus,
  Loader2,
  Code,
  ExternalLink,
  Trash2,
  X,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  createdAt: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const emptyForm = {
  title: "",
  description: "",
  image: "",
  githubUrl: "",
  liveUrl: "",
  techStack: [] as string[],
};

export default function PortfolioPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/my`,
        { headers: { Authorization: token! } }
      );
      setItems(res.data);
    } catch {
      setError("Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
      setTechInput("");
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      setError("Title and description are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio`,
        form,
        { headers: { Authorization: token! } }
      );
      setShowForm(false);
      setForm(emptyForm);
      setTechInput("");
      await fetchPortfolio();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/${id}`,
        { headers: { Authorization: token! } }
      );
      setItems(items.filter((i) => i.id !== id));
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

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
          <motion.div variants={item} className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                My <span className="italic text-amber-400">Portfolio</span>
              </h1>
              <p className="text-muted-foreground">Showcase your best work to clients.</p>
            </div>
            <Button
              onClick={() => { setShowForm(true); setError(""); }}
              className="bg-amber-500 hover:bg-amber-400 cursor-pointer text-slate-950 font-semibold rounded-full gap-2 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.35)] transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </motion.div>

          {error && (
            <motion.div variants={item} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </motion.div>
          )}

          {/* Add form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card border-amber-500/20">
                  <CardContent className="p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        New Portfolio Item
                      </h2>
                      <button
                        onClick={() => { setShowForm(false); setForm(emptyForm); }}
                        className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Title *</label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="e.g. E-commerce Dashboard"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Cover Image URL</label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="https://..."
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground">Description *</label>
                      <textarea
                        rows={3}
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                        placeholder="Describe what you built and your role..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">GitHub URL</label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="https://github.com/..."
                          value={form.githubUrl}
                          onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Live URL</label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="https://..."
                          value={form.liveUrl}
                          onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground">Tech Stack</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="e.g. React"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                        />
                        <Button size="sm" variant="outline" onClick={addTech} className="border-border cursor-pointer hover:border-amber-500/40">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {form.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {form.techStack.map((t) => (
                            <Badge key={t} variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1 text-xs">
                              {t}
                              <button onClick={() => setForm({ ...form, techStack: form.techStack.filter((x) => x !== t) })}>
                                <X className="w-3 h-3 cursor-pointer" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="text-muted-foreground cursor-pointer">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 font-semibold rounded-full px-6"
                      >
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Project"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portfolio grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <motion.div variants={item} className="text-center py-20">
              <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No portfolio items yet.</p>
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                className="mt-4 bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 rounded-full"
              >
                Add your first project
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {items.map((portfolioItem) => (
                <motion.div key={portfolioItem.id} variants={item}>
                  <Card className="bg-card border-border/60 hover:border-amber-500/25 transition-all duration-300 group overflow-hidden">
                    {/* Image */}
                    <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden">
                      {portfolioItem.image ? (
                        <img
                          src={portfolioItem.image}
                          alt={portfolioItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold text-base leading-tight"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {portfolioItem.title}
                        </h3>
                        <button
                          onClick={() => handleDelete(portfolioItem.id)}
                          disabled={deletingId === portfolioItem.id}
                          className="text-muted-foreground cursor-pointer hover:text-red-400 transition-colors shrink-0"
                        >
                          {deletingId === portfolioItem.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{portfolioItem.description}</p>
                      {portfolioItem.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {portfolioItem.techStack.slice(0, 4).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs border-amber-500/20 text-amber-400/70 bg-amber-500/5">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-auto">
                        {portfolioItem.githubUrl && (
                          <a href={portfolioItem.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground cursor-pointer hover:text-foreground h-7 px-2 gap-1">
                              <Code className="w-3.5 h-3.5" /> Code
                            </Button>
                          </a>
                        )}
                        {portfolioItem.liveUrl && (
                          <a href={portfolioItem.liveUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground cursor-pointer hover:text-amber-400 h-7 px-2 gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Live
                            </Button>
                          </a>
                        )}
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