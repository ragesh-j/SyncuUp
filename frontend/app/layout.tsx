import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncUp — Realtime Coaching Feed",
  description: "Stay in sync with your coaching team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}