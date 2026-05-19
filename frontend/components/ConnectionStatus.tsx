"use client";

import type { SocketStatus } from "@/types/feed";

interface StatusConfig { color: string; label: string; pulse: boolean; }

const STATUS_CONFIG: Record<SocketStatus, StatusConfig> = {
  connected:    { color: "#3ecf8e", label: "Live",         pulse: true  },
  connecting:   { color: "#f5a623", label: "Connecting…",  pulse: false },
  disconnected: { color: "#f06060", label: "Disconnected", pulse: false },
  error:        { color: "#f06060", label: "Error",        pulse: false },
};

export default function ConnectionStatus({ status }: { status: SocketStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"5px 12px", borderRadius:"99px", background:"var(--surface-2)", border:"1px solid var(--border)", fontSize:"12px", fontWeight:500, color:cfg.color }}>
      <span style={{ position:"relative", display:"inline-flex" }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:cfg.color, display:"block" }} />
        {cfg.pulse && <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:cfg.color, animation:"pulse-ring 1.4s ease-out infinite" }} />}
      </span>
      {cfg.label}
    </div>
  );
}