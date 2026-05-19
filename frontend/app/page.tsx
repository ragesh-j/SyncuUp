"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useFeed } from "@/hooks/useFeed";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import ConnectionStatus from "@/components/ConnectionStatus";
import type { FeedCategory } from "@/types/feed";

const CATEGORIES: FeedCategory[] = [
  "mindset", "technique", "nutrition", "recovery", "strategy", "general",
];

export default function HomePage() {
  const [category, setCategory] = useState<FeedCategory | null>(null);
  const { items, meta, loading, error, newCount, clearNewCount, loadMore, refresh, socketStatus } =
    useFeed({ category });

  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length === 0 || newCount === 0) return;
    const latestId = items[0]?._id;
    if (!latestId) return;
    setNewIds((prev) => new Set([...prev, latestId]));
    const t = setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(latestId);
        return next;
      });
    }, 4000);
    return () => clearTimeout(t);
  }, [items, newCount]);

  const handleScrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    clearNewCount();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        backgroundImage: `
          radial-gradient(ellipse 60% 40% at 50% -10%, rgba(124,106,245,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 80% 60%, rgba(62,207,142,0.04) 0%, transparent 60%)
        `,
      }}
    >
      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(245,245,247,0.85", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:720, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, background:"linear-gradient(135deg, #111118 40%, var(--accent-bright))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.02em" }}>
              SyncUp
            </span>
            <span style={{ fontSize:11, fontWeight:600, background:"var(--accent-glow)", color:"var(--accent-bright)", border:"1px solid rgba(124,106,245,0.3)", borderRadius:5, padding:"2px 7px", fontFamily:"var(--font-display)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              Feed
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <ConnectionStatus status={socketStatus} />
            <Link href="/admin" style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:13, color:"var(--text-muted)", textDecoration:"none", padding:"6px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)" }}>
              Admin →
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 64px" }}>
        <div ref={topRef} />

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"clamp(26px, 4vw, 34px)", letterSpacing:"-0.03em", color:"var(--text)", lineHeight:1.15, marginBottom:8 }}>
            Coaching Feed
          </h1>
          <p style={{ color:"var(--text-muted)", fontSize:14 }}>
            Realtime updates from your coaching team. New posts appear instantly.
          </p>
        </div>

        {/* Category filters */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
          <button
            onClick={() => setCategory(null)}
            style={{ fontSize:12, fontWeight:600, fontFamily:"var(--font-display)", letterSpacing:"0.04em", padding:"6px 14px", borderRadius:8, border:`1px solid ${!category ? "var(--accent)" : "var(--border)"}`, background:!category ? "var(--accent-glow)" : "var(--surface)", color:!category ? "var(--accent-bright)" : "var(--text-muted)", cursor:"pointer" }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? null : cat)}
              className={category === cat ? `cat-${cat}` : ""}
              style={{ fontSize:12, fontWeight:600, fontFamily:"var(--font-display)", letterSpacing:"0.04em", padding:"6px 14px", borderRadius:8, border:`1px solid ${category === cat ? "transparent" : "var(--border)"}`, background:category === cat ? undefined : "var(--surface)", color:category === cat ? undefined : "var(--text-muted)", cursor:"pointer", textTransform:"capitalize" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* New items badge */}
        {newCount > 0 && (
          <button
            onClick={handleScrollTop}
            className="animate-slide-in"
            style={{ width:"100%", marginBottom:16, padding:"10px", borderRadius:10, border:"1px solid var(--accent)", background:"var(--accent-glow)", color:"var(--accent-bright)", fontFamily:"var(--font-display)", fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          >
            <span style={{ width:18, height:18, borderRadius:"50%", background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
              {newCount}
            </span>
            new update{newCount > 1 ? "s" : ""} — click to see
          </button>
        )}

        {/* States */}
        {loading && <FeedSkeleton count={5} />}

        {error && (
          <div style={{ padding:"18px 22px", borderRadius:12, background:"rgba(240,96,96,0.08)", border:"1px solid rgba(240,96,96,0.25)", color:"#f06060", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:14 }}>⚠ {error}</span>
            <button onClick={refresh} style={{ fontSize:12, fontWeight:600, color:"#f06060", background:"transparent", border:"1px solid rgba(240,96,96,0.4)", padding:"5px 12px", borderRadius:7, cursor:"pointer" }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-muted)", fontSize:14 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📭</div>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:600, marginBottom:6 }}>No posts yet</p>
            <p style={{ color:"var(--text-faint)" }}>Head to the admin page to add the first coaching update.</p>
          </div>
        )}

        {/* Feed list */}
        {!loading && items.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {items.map((item) => (
              <FeedCard key={item._id} item={item} isNew={newIds.has(item._id)} />
            ))}
          </div>
        )}

        {/* Load more */}
        {meta && meta.page < meta.totalPages && !loading && (
          <div style={{ textAlign:"center", marginTop:28 }}>
            <button
              onClick={() => loadMore(meta.page + 1)}
              style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:13, color:"var(--text-muted)", background:"var(--surface)", border:"1px solid var(--border)", padding:"10px 24px", borderRadius:9, cursor:"pointer" }}
            >
              Load more
            </button>
          </div>
        )}

        {/* Cache indicator */}
        {meta && (
          <div style={{ marginTop:32, textAlign:"center", fontSize:11, color:"var(--text-faint)", fontFamily:"var(--font-display)", letterSpacing:"0.04em" }}>
            {meta.fromCache ? "⚡ served from cache" : "📦 fresh from database"} · {meta.total} total post{meta.total !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </div>
  );
}