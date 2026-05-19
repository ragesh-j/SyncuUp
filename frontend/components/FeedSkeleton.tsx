export default function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shimmer" style={{ borderRadius:14, border:"1px solid var(--border)", padding:"20px 22px", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"var(--border)" }} />
            <div style={{ flex:1 }}>
              <div style={{ height:14, width:"55%", borderRadius:5, background:"var(--border)", marginBottom:8 }} />
              <div style={{ height:11, width:"30%", borderRadius:5, background:"var(--border)" }} />
            </div>
            <div style={{ width:60, height:22, borderRadius:6, background:"var(--border)" }} />
          </div>
          <div>
            <div style={{ height:12, borderRadius:5, background:"var(--border)", marginBottom:6 }} />
            <div style={{ height:12, width:"80%", borderRadius:5, background:"var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}