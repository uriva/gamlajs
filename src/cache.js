import NodeCache from "node-cache";
import hash from "object-hash";
import { isNil } from "ramda";

export const withCacheAsync = (f, options) => {
  const cache = new NodeCache(options);
  return withCacheAsyncCustom(cache.get, cache.set, f);
};

export const withCacheAsyncCustom = (get, set, f) => async (...args) => {
  const cacheKey = hash.sha1(args);
  const value = await get(cacheKey);
  if (!isNil(value)) {
    return value;
  }
  const result = await f.apply(this, args);
  set(cacheKey, result);
  return result;
};
