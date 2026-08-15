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

const emptyForm = {
  title: "",
  description: "",
  image: "",
  githubUrl: "",
  liveUrl: "",
  techStack: [] as string[],
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PortfolioPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
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

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchPortfolio();
  }, [isLoaded, isSignedIn]);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });
  };

  const saveItem = async () => {
    if (!form.title || !form.description) {
      setError("Title and description required.");
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
      setForm(emptyForm);
      setShowForm(false);
      await fetchPortfolio();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setDeletingId(id);
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/${id}`, {
        headers: { Authorization: token! },
      });
      await fetchPortfolio();
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingId(null);
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
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                My <span className="italic text-amber-400">Portfolio</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Showcase your best work to attract clients.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full px-6 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </motion.div>

          {error && (
            <motion.div variants={item} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-amber-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Add Portfolio Item
                  </h3>
                  <button onClick={() => setShowForm(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Project title"
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    rows={3}
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                    value={form.image || ""}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                      value={form.githubUrl || ""}
                      onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="Live URL"
                      className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                      value={form.liveUrl || ""}
                      onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tech (React, TypeScript, etc.)"
                      className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:border-amber-500/50"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    />
                    <Button size="sm" onClick={addTech} variant="outline" className="border-border">
                      Add
                    </Button>
                  </div>
                  {form.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.techStack.map((t) => (
                        <Badge key={t} className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                          {t}
                          <button onClick={() => removeTech(t)} className="ml-1 text-amber-300 hover:text-amber-200">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={saveItem}
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-semibold self-end"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Item"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.length === 0 ? (
            <motion.div variants={item} className="flex flex-col items-center justify-center py-20">
              <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your portfolio is empty.</p>
              <p className="text-sm text-muted-foreground">Add your best work to stand out to clients.</p>
            </motion.div>
          ) : (
            <motion.div variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <motion.div key={item.id}>
                  <Card className="bg-card border-border/60 overflow-hidden hover:border-amber-500/25 transition-all duration-300">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                      {item.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.techStack.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs border-amber-500/20 text-amber-400/70">
                              {t}
                            </Badge>
                          ))}
                          {item.techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                              +{item.techStack.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {item.liveUrl && (
                          <a href={item.liveUrl} target="_blank" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Live
                          </a>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="ml-auto text-xs text-red-400 hover:text-red-300"
                        >
                          {deletingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
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