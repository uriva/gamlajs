import { after, pipe } from "./composition.js";

import { isPromise } from "./promise.js";
import { reduce } from "./reduce.js";

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
