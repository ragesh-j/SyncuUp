"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchFeed } from "@/lib/api";
import { useSocket } from "./useSocket";
import type { FeedItem, FeedCategory, FeedMeta, SocketStatus } from "@/types/feed";

const SEEN_IDS_LIMIT = 200;

interface UseFeedOptions {
  category?: FeedCategory | null;
}

interface UseFeedReturn {
  items: FeedItem[];
  meta: FeedMeta | null;
  loading: boolean;
  error: string | null;
  newCount: number;
  clearNewCount: () => void;
  loadMore: (page: number) => void;
  refresh: () => void;
  socketStatus: SocketStatus;
}

export const useFeed = ({ category }: UseFeedOptions = {}): UseFeedReturn => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [meta, setMeta] = useState<FeedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  const seenIds = useRef(new Set<string>());
  const { on, status } = useSocket();

  const load = useCallback(async (page = 1, append = false) => {
    try {
      setError(null);
      if (!append){
        setLoading(true);
        seenIds.current = new Set();
      }  
      const res = await fetchFeed({ page, limit: 20, category: category ?? undefined });
      setMeta(res.meta);
      const incoming = res.data.filter((f) => !seenIds.current.has(f._id));
      incoming.forEach((f) => seenIds.current.add(f._id));
      if (seenIds.current.size > SEEN_IDS_LIMIT) {
        seenIds.current = new Set([...seenIds.current].slice(-SEEN_IDS_LIMIT));
      }
      setItems((prev) => append ? [...prev, ...incoming] : incoming);
    } catch (err) {
        console.error("Feed error:", err);
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(1, false); }, [load]);

  useEffect(() => {
    const unsub = on<{ feed: FeedItem }>("feed:new", ({ feed }) => {
      if (!feed?._id || seenIds.current.has(feed._id)) return;
      seenIds.current.add(feed._id);
      setItems((prev) => [feed, ...prev]);
      setNewCount((c) => c + 1);
    });
    return unsub;
  }, [on]);

  const clearNewCount = useCallback(() => setNewCount(0), []);
  const loadMore = useCallback((page: number) => load(page, true), [load]);
  const refresh = useCallback(() => load(1, false), [load]);

  return { items, meta, loading, error, newCount, clearNewCount, loadMore, refresh, socketStatus: status };
};