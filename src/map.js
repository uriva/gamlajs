import { after, pipe } from "./composition.js";

import { isPromise } from "./promise.ts";
import { reduce } from "./reduce.ts";

export const map = (f) => (xs) => {
  const results = [];
  for (const x of xs) {
    results.push(f(x));
  }
  return results.some(isPromise) ? Promise.all(results) : results;
};

export const mapCat = pipe(
  map,
  after(
    reduce(
      (a, b) => a.concat(b),
      () => [],
    ),
  ),
);
