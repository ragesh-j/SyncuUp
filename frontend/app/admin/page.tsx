"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createFeedItem } from "@/lib/api";
import type { FeedCategory, CreateFeedPayload } from "@/types/feed";

const CATEGORIES: FeedCategory[] = [
  "mindset", "technique", "nutrition", "recovery", "strategy", "general",
];

interface FormState {
  title: string;
  content: string;
  author: string;
  category: FeedCategory;
  tags: string;
  pinned: boolean;
}

const DEFAULT_FORM: FormState = {
  title: "", content: "", author: "", category: "general", tags: "", pinned: false,
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function AdminPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const payload: CreateFeedPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim(),
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      pinned: form.pinned,
    };

    try {
      await createFeedItem(payload);
      setStatus("success");
      setForm(DEFAULT_FORM);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to post");
    }
  };

  const field = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"10px 14px", borderRadius:9,
    background:"var(--surface-2)", border:"1px solid var(--border)",
    color:"var(--text)", fontSize:14, fontFamily:"var(--font-body)", outline:"none",
  };

  const labelStyle: React.CSSProperties = {
    display:"block", fontSize:12, fontWeight:600, fontFamily:"var(--font-display)",
    letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:7,
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", backgroundImage:"radial-gradient(ellipse 60% 40% at 50% -10%, rgba(124,106,245,0.10) 0%, transparent 70%)" }}>
      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(245,245,247,0.85)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:680, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Link href="/" style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, background:"linear-gradient(135deg, #111118 40%, var(--accent-bright))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", textDecoration:"none", letterSpacing:"-0.02em" }}>
              SyncUp
            </Link>
            <span style={{ fontSize:11, fontWeight:600, background:"rgba(240,96,96,0.12)", color:"#f06060", border:"1px solid rgba(240,96,96,0.3)", borderRadius:5, padding:"2px 7px", fontFamily:"var(--font-display)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              Admin
            </span>
          </div>
          <Link href="/" style={{ fontSize:13, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text-muted)", textDecoration:"none", padding:"6px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)" }}>
            ← Feed
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px 80px" }}>
        <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"clamp(24px, 4vw, 32px)", letterSpacing:"-0.03em", color:"var(--text)", marginBottom:6 }}>
          New coaching update
        </h1>
        <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:36 }}>
          Posts appear on the feed instantly via WebSocket.
        </p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:22 }}>

          <div>
            <label style={labelStyle}>Title *</label>
            <input {...field("title")} style={inputStyle} placeholder="e.g. Focus on recovery this week" maxLength={200} required />
          </div>

          <div>
            <label style={labelStyle}>Content *</label>
            <textarea {...field("content")} style={{ ...inputStyle, minHeight:120, resize:"vertical", lineHeight:1.6 }} placeholder="Share the coaching update, tip, or insight…" maxLength={2000} required />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={labelStyle}>Author *</label>
              <input {...field("author")} style={inputStyle} placeholder="Coach name" maxLength={100} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select {...field("category")} style={inputStyle}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags <span style={{ opacity:0.5, textTransform:"none", letterSpacing:0 }}>comma-separated</span></label>
            <input {...field("tags")} style={inputStyle} placeholder="strength, week-4, recovery" />
          </div>

          {/* Pinned toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button
              type="button"
              role="switch"
              aria-checked={form.pinned}
              onClick={() => setForm((p) => ({ ...p, pinned: !p.pinned }))}
              style={{ width:44, height:24, borderRadius:99, border:"none", cursor:"pointer", background:form.pinned ? "var(--accent)" : "var(--border)", position:"relative", transition:"background 0.2s", flexShrink:0 }}
            >
              <span style={{ position:"absolute", top:3, left:form.pinned ? 23 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
            </button>
            <span style={{ fontSize:14, color:"var(--text-muted)" }}>Pin to top of feed</span>
          </div>

          {/* Error / success feedback */}
          {status === "error" && (
            <div style={{ padding:"12px 16px", borderRadius:9, background:"rgba(240,96,96,0.08)", border:"1px solid rgba(240,96,96,0.25)", color:"#f06060", fontSize:13 }}>
              ⚠ {errorMsg}
            </div>
          )}
          {status === "success" && (
            <div style={{ padding:"12px 16px", borderRadius:9, background:"rgba(62,207,142,0.08)", border:"1px solid rgba(62,207,142,0.25)", color:"#3ecf8e", fontSize:13 }}>
              ✓ Post published — it&apos;s live on the feed
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={{ padding:"13px 28px", borderRadius:10, border:"none", cursor:status === "loading" ? "not-allowed" : "pointer", background:status === "loading" ? "var(--border)" : "var(--accent)", color:"#fff", fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, transition:"all 0.2s", opacity:status === "loading" ? 0.7 : 1 }}
          >
            {status === "loading" ? "Publishing…" : "Publish update"}
          </button>
        </form>
      </main>
    </div>
  );
}