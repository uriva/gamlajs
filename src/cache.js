import NodeCache from "node-cache";
import hash from "object-hash";
import { isNil } from "ramda";
import { throttle } from "./lock";

const getCacheKey = (args) => hash.sha1(args);

export const withCacheAsync = (f, options) => {
  const cache = new NodeCache(options);
  return withCacheAsyncCustom(cache.get, cache.set, f);
};

export const withCacheAsyncCustom = (get, set, f) =>
  throttle(1, async (...args) => {
    const cacheKey = getCacheKey(args);
    const value = await get(cacheKey);
    if (!isNil(value)) {
      return value;
    }
    const result = await f.apply(this, args);
    set(cacheKey, result);
    return result;
  });

export const deleteCacheAsync =
  (del) =>
  (...args) =>
    del(getCacheKey(args));
