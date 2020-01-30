import NodeCache from "node-cache";
import hash from "object-hash";

export const withCacheAsync = (f, options) => {
  const cache = new NodeCache(options);
  return async (...args) => {
    const cacheKey = hash.sha1(args);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const result = await f.apply(this, args);
    cache.set(cacheKey, result);
    return result;
  };
};
