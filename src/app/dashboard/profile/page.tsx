"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  DollarSign,
  Clock,
  Tag,
  FileText,
} from "lucide-react";

const AVAILABILITY_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time", desc: "40+ hrs/week" },
  { value: "PART_TIME", label: "Part-time", desc: "20 hrs/week" },
  { value: "CONTRACT", label: "Contract", desc: "Project-based" },
  { value: "NOT_AVAILABLE", label: "Not available", desc: "Not taking work" },
];

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ProfilePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { data: dashData, refetch } = useDashboard();
  const user = dashData?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    bio: "",
    hourlyRate: "",
    availability: "FULL_TIME",
    skills: [] as string[],
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
          { headers: { Authorization: token! } }
        );
        const p = res.data;
        setForm({
          bio: p.bio || "",
          hourlyRate: p.hourlyRate ? String(p.hourlyRate) : "",
          availability: p.availability || "FULL_TIME",
          skills: p.skills || [],
        });
      } catch {
        // profile fields not set yet — keep defaults
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          bio: form.bio,
          hourlyRate: form.hourlyRate ? parseInt(form.hourlyRate) : null,
          availability: form.availability,
          skills: form.skills,
        },
        { headers: { Authorization: token! } }
      );
      await refetch();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save profile.");
    } finally {
      setSaving(false);
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
          <motion.div variants={item} className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              My <span className="italic text-amber-400">Profile</span>
            </h1>
            <p className="text-muted-foreground">How clients see you. Keep it up to date.</p>
          </motion.div>

          {error && (
            <motion.div variants={item} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved successfully!
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : (
            <>
              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <User className="w-4 h-4 text-amber-400" /> Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 shrink-0">
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className="bg-amber-500/10 text-amber-400 text-lg">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      {user?.role && (
                        <Badge variant="outline" className="w-fit text-xs border-amber-500/30 text-amber-400 mt-1">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground ml-auto self-end">Managed via Clerk</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <FileText className="w-4 h-4 text-amber-400" /> About
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">Bio</label>
                      <textarea
                        rows={4}
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                        placeholder="Tell clients about yourself — your background, expertise, and what makes you great..."
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground text-right">{form.bio.length}/500</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> Hourly Rate (USD)
                      </label>
                      <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          className="w-full bg-secondary border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="50"
                          value={form.hourlyRate}
                          onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <Clock className="w-4 h-4 text-amber-400" /> Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setForm({ ...form, availability: opt.value })}
                          className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            form.availability === opt.value
                              ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                              : "border-border text-muted-foreground hover:border-amber-500/30"
                          }`}
                        >
                          <span className="text-sm font-medium">{opt.label}</span>
                          <span className="text-xs opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <Tag className="w-4 h-4 text-amber-400" /> Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder="e.g. React, Figma, Node.js"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addSkill}
                        className="border-border cursor-pointer hover:border-amber-500/40 hover:text-amber-400"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {form.skills.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="border-amber-500/30 text-amber-400 bg-amber-500/5 gap-1 pr-1"
                          >
                            {s}
                            <button onClick={() => removeSkill(s)} className="hover:text-red-400 cursor-pointer transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No skills added yet. Add skills that match the projects you want to work on.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item} className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 cursor-pointer text-slate-950 font-semibold px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_24px_hsla(40,85%,58%,0.4)]"
                >
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Profile"}
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}