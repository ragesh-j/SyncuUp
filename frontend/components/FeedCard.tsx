"use client";

import type { FeedItem, FeedCategory } from "@/types/feed";

const CATEGORY_ICONS: Record<FeedCategory, string> = {
  mindset:"🧠", technique:"⚡", nutrition:"🥗", recovery:"💤", strategy:"♟️", general:"📌",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function FeedCard({ item, isNew = false }: { item: FeedItem; isNew?: boolean }) {
  const cat = item.category ?? "general";
  return (
    <article className={isNew ? "animate-slide-in" : "animate-fade-up"}
      style={{ background:"var(--surface)", border:`1px solid ${isNew?"var(--accent)":"var(--border)"}`, borderRadius:"14px", padding:"20px 22px", display:"flex", flexDirection:"column", gap:"10px", position:"relative", overflow:"hidden" }}>
      {item.pinned && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, var(--accent), var(--accent-bright))" }} />}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <span style={{ width:36, height:36, borderRadius:"10px", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
            {CATEGORY_ICONS[cat]}
          </span>
          <div style={{ minWidth:0 }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"15px", color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</h3>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <span style={{ fontSize:12, color:"var(--text-muted)" }}>{item.author}</span>
              <span style={{ color:"var(--text-faint)", fontSize:10 }}>•</span>
              <span style={{ fontSize:12, color:"var(--text-muted)" }}>{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </div>
        <span className={`cat-${cat}`} style={{ fontSize:11, fontWeight:600, fontFamily:"var(--font-display)", letterSpacing:"0.05em", textTransform:"uppercase", padding:"3px 9px", borderRadius:6, border:"1px solid", whiteSpace:"nowrap", flexShrink:0 }}>{cat}</span>
      </div>
      <p style={{ color:"var(--text-muted)", fontSize:"14px", lineHeight:1.65 }}>{item.content}</p>
      {item.tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {item.tags.map(tag => <span key={tag} style={{ fontSize:11, color:"var(--text-faint)", background:"var(--surface-2)", border:"1px solid var(--border)", padding:"2px 8px", borderRadius:5 }}>#{tag}</span>)}
        </div>
      )}
    </article>
  );
}