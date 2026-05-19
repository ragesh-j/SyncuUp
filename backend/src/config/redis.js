const Redis = require("ioredis");

let redisClient = null;
let isRedisAvailable = false;

const createRedisClient = () => {
  const url = process.env.REDIS_URL || "redis://localhost:6379";

  const client = new Redis(url, {
    lazyConnect: true,
    retryStrategy: (times) => {
      // Retry with exponential backoff, max 30s
      const delay = Math.min(times * 500, 30000);
      console.log(`⏳ Redis retry #${times} in ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  client.on("connect", () => {
    isRedisAvailable = true;
    console.log("✅ Redis connected");
  });

  client.on("ready", () => {
    isRedisAvailable = true;
  });

  client.on("error", (err) => {
    if (isRedisAvailable) {
      console.warn("⚠️  Redis error (cache disabled):", err.message);
    }
    isRedisAvailable = false;
  });

  client.on("close", () => {
    isRedisAvailable = false;
  });

  return client;
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    redisClient.connect().catch(() => {
      // Silently fail — cache is optional
    });
  }
  return redisClient;
};

/**
 * Safe cache get — returns null if Redis is down
 */
const cacheGet = async (key) => {
  if (!isRedisAvailable) return null;
  try {
    const data = await getRedisClient().get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Safe cache set — no-op if Redis is down
 */
const cacheSet = async (key, value, ttl = 30) => {
  if (!isRedisAvailable) return;
  try {
    await getRedisClient().setex(key, ttl, JSON.stringify(value));
  } catch {
    // Silently fail
  }
};

/**
 * Invalidate a cache key
 */
const cacheDel = async (key) => {
  if (!isRedisAvailable) return;
  try {
    await getRedisClient().del(key);
  } catch {
    // Silently fail
  }
};

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel, isRedisAvailable: () => isRedisAvailable };