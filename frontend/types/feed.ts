export type FeedCategory =
  | "mindset"
  | "technique"
  | "nutrition"
  | "recovery"
  | "strategy"
  | "general";

export interface FeedItem {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: FeedCategory;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  fromCache: boolean;
  cacheActive: boolean;
}

export interface FeedResponse {
  success: boolean;
  data: FeedItem[];
  meta: FeedMeta;
}

export interface CreateFeedPayload {
  title: string;
  content: string;
  author: string;
  category?: FeedCategory;
  tags?: string[];
  pinned?: boolean;
}

export type SocketStatus = "connecting" | "connected" | "disconnected" | "error";