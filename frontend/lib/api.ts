import type { FeedCategory, FeedResponse, CreateFeedPayload } from "@/types/feed";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface FetchFeedParams {
  page?: number;
  limit?: number;
  category?: FeedCategory;
}

export const fetchFeed = async ({
  page = 1,
  limit = 20,
  category,
}: FetchFeedParams = {}): Promise<FeedResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);

  const res = await fetch(`${API_URL}/feed?${params}`, { cache: "no-store" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<FeedResponse>;
};

export const createFeedItem = async (
  payload: CreateFeedPayload
): Promise<{ success: boolean; data: import("@/types/feed").FeedItem }> => {
  const res = await fetch(`${API_URL}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json();
};