// In-memory cache for scan results, keyed by scanner + root hash (+ config).
import crypto from "node:crypto";
import path from "node:path";

const cache = new Map();
const DEFAULT_TTL_MS = Number(process.env.SCAN_CACHE_TTL_MS) || 5 * 60 * 1000;

export function hashRoot(root) {
  const resolved = path.resolve(String(root || ""));
  return crypto.createHash("sha256").update(resolved).digest("hex");
}

export function buildScanCacheKey(scanner, root, config = {}) {
  const cfg = config && typeof config === "object" ? config : {};
  // exclude cache bypass flags from key
  const rest = { ...cfg };
  delete rest.cache;
  return `${scanner}:${hashRoot(root)}:${stableStringify(rest)}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

export function getScanCache(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  // return a shallow clone to avoid mutation of cached data
  return Array.isArray(entry.value) ? entry.value.map((x) => (x && typeof x === "object" ? { ...x } : x)) : entry.value;
}

const MAX_CACHE_ENTRIES = 500;
export function setScanCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    // evict oldest entry
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [k, v] of cache.entries()) {
      if (v.createdAt < oldestTime) { oldestTime = v.createdAt; oldestKey = k; }
    }
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, {
    value: Array.isArray(value) ? value.map((x) => (x && typeof x === "object" ? { ...x } : x)) : value,
    expiresAt: Date.now() + (Number.isFinite(ttlMs) ? ttlMs : DEFAULT_TTL_MS),
    createdAt: Date.now(),
  });
  return value;
}

export function clearScanCache() {
  cache.clear();
}

export function getScanCacheStats() {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}

export function cachedScan(scanner, root, config, fn) {
  const cfg = config || {};
  if (cfg.cache === false) {
    return fn();
  }
  const key = buildScanCacheKey(scanner, root, cfg);
  const cached = getScanCache(key);
  if (cached !== undefined) {
    return cached;
  }
  const result = fn();
  // support sync/async
  if (result && typeof result.then === "function") {
    return result.then((r) => {
      setScanCache(key, r);
      return getScanCache(key) ?? r;
    });
  }
  setScanCache(key, result);
  return getScanCache(key) ?? result;
}

export default {
  hashRoot,
  buildScanCacheKey,
  getScanCache,
  setScanCache,
  clearScanCache,
  getScanCacheStats,
  cachedScan,
};