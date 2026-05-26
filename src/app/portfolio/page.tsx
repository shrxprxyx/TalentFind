"use client";

import { useEffect, useState, useRef } from "react";
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
  Trash2,
  ExternalLink,
  ImageIcon,
  X,
  FolderOpen,
  AlertCircle,
  Globe,
  Tag,
  FileText,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  tags: string[];
  category: string;
  createdAt: string;
}

const CATEGORIES = ["Web Dev", "Mobile", "Design", "Writing", "Video", "Other"];

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PortfolioPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    category: "Web Dev",
    tags: [] as string[],
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio`,
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
    fetchItems();
  }, [isLoaded, isSignedIn]);

  const resetForm = () => {
    setForm({ title: "", description: "", imageUrl: "", link: "", category: "Web Dev", tags: [] });
    setTagInput("");
    setShowForm(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError("Title and description are required.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const token = await getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio`,
        form,
        { headers: { Authorization: token! } }
      );
      setItems([res.data, ...items]);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to add item.");
    } finally {
      setSubmitting(false);
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
      setError("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <motion.div variants={item} className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                My <span className="italic text-amber-400">Portfolio</span>
              </h1>
              <p className="text-muted-foreground">Showcase your best work to attract clients.</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-500 hover:bg-amber-400 cursor-pointer text-slate-950 font-semibold rounded-full px-5 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Project
            </Button>
          </motion.div>

          {error && (
            <motion.div variants={item} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              <button onClick={() => setError("")} className="ml-auto cursor-pointer hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
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
                      <h2 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                        New Portfolio Item
                      </h2>
                      <button onClick={resetForm} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">Title <span className="text-red-400">*</span></label>
                      <input
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder="e.g. E-commerce Dashboard"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">Description <span className="text-red-400">*</span></label>
                      <textarea
                        rows={3}
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                        placeholder="What did you build? What was the impact?"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    {/* Image URL + Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> Image URL
                        </label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="https://..."
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Live Link
                        </label>
                        <input
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="https://..."
                          value={form.link}
                          onChange={(e) => setForm({ ...form, link: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setForm({ ...form, category: cat })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                              form.category === cat
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                                : "border-border text-muted-foreground hover:border-amber-500/30"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Tech / Tools
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="e.g. React, Figma"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button size="sm" variant="outline" onClick={addTag} className="border-border cursor-pointer hover:border-amber-500/40 hover:text-amber-400">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {form.tags.map((t) => (
                            <Badge key={t} variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1">
                              {t}
                              <button onClick={() => removeTag(t)} className="hover:text-red-400 cursor-pointer transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <Button variant="ghost" onClick={resetForm} className="text-muted-foreground cursor-pointer hover:text-foreground">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-amber-500 hover:bg-amber-400 cursor-pointer text-slate-950 font-semibold rounded-full px-6"
                      >
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Add to Portfolio"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <motion.div variants={item} className="text-center py-20">
              <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Your portfolio is empty.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Add your best work to stand out to clients.</p>
              <Button
                size="sm"
                className="mt-4 bg-amber-500 cursor-pointer hover:bg-amber-400 text-slate-950 rounded-full"
                onClick={() => setShowForm(true)}
              >
                Add your first project
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {items.map((portfolioItem) => (
                <motion.div key={portfolioItem.id} variants={cardVariant}>
                  <Card className="bg-card border-border/60 hover:border-amber-500/25 transition-all duration-300 hover:shadow-[0_0_20px_hsla(40,85%,58%,0.06)] group h-full flex flex-col overflow-hidden">
                    {/* Image */}
                    <div className="relative w-full aspect-video bg-secondary overflow-hidden">
                      {portfolioItem.imageUrl ? (
                        <img
                          src={portfolioItem.imageUrl}
                          alt={portfolioItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                      )}
                      {/* Category pill */}
                      <span className="absolute top-2.5 left-2.5 text-xs font-medium px-2 py-0.5 rounded-full bg-black/60 text-white/80 backdrop-blur-sm">
                        {portfolioItem.category}
                      </span>
                      {/* Actions overlay */}
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {portfolioItem.link && (
                          <a
                            href={portfolioItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-amber-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(portfolioItem.id)}
                          disabled={deletingId === portfolioItem.id}
                          className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          {deletingId === portfolioItem.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-4 flex flex-col gap-2.5 flex-1">
                      <h3
                        className="font-semibold text-sm leading-snug group-hover:text-amber-400 transition-colors"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {portfolioItem.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {portfolioItem.description}
                      </p>
                      {portfolioItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-1">
                          {portfolioItem.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-amber-500/20 text-amber-400/70 bg-amber-500/5 px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {portfolioItem.tags.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{portfolioItem.tags.length - 4}</span>
                          )}
                        </div>
                      )}
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