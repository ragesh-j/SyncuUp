const express = require("express");
const router = express.Router();
const Feed = require("../models/Feed");
const { cacheGet, cacheSet, cacheDel, isRedisAvailable } = require("../config/redis");
const { validateFeedPost, validateFeedQuery } = require("../middleware/validation");

const CACHE_TTL = parseInt(process.env.FEED_CACHE_TTL) || 30;

/**
 * Build a deterministic cache key from query params
 */
const buildCacheKey = ({ page, limit, category }) => {
  return `feed:list:p${page}:l${limit}:c${category || "all"}`;
};

/**
 * GET /feed
 * Returns paginated feed items.
 * Response served from Redis cache when available; falls back to DB.
 */
router.get("/", validateFeedQuery, async (req, res) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const { category } = req.query;
  const cacheKey = buildCacheKey({ page, limit, category });
 
  try {
    // 1. Try cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        ...cached,
        meta: { ...cached.meta, fromCache: true, cacheActive: true },
      });
    }
 
    // 2. Query DB
    const filter = {};
    if (category) filter.category = category;
 
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Feed.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feed.countDocuments(filter),
    ]);
 
    const payload = {
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        fromCache: false,
        cacheActive: isRedisAvailable(),
      },
    };
 
    // 3. Store in cache
    await cacheSet(cacheKey, payload, CACHE_TTL);
 
    return res.status(200).json(payload);
  } catch (err) {
    console.error("GET /feed error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch feed" });
  }
});

/**
 * POST /feed
 * Creates a new feed item, invalidates relevant caches, emits socket event.
 */
router.post("/", validateFeedPost, async (req, res) => {
  const { title, content, author, category = "general", tags = [], pinned = false } = req.body;

  try {
    const feed = await Feed.create({ title, content, author, category, tags, pinned });

    // Invalidate all feed list caches (pattern: feed:list:*)
    // We do a simple targeted invalidation of common page 1 keys.
    // For production: use Redis SCAN to find keys matching the pattern.
    const keysToInvalidate = [
      buildCacheKey({ page: 1, limit: 20, category: null }),
      buildCacheKey({ page: 1, limit: 20, category }),
    ];
    await Promise.all(keysToInvalidate.map(cacheDel));

    // Emit realtime event via Socket.IO (injected into req by app)
    const io = req.app.get("io");
    if (io) {
      io.emit("feed:new", { feed });
    }

    return res.status(201).json({ success: true, data: feed });
  } catch (err) {
    console.error("POST /feed error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
    }
    return res.status(500).json({ success: false, message: "Failed to create feed item" });
  }
});

module.exports = router;