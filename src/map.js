import { after, pipe } from "./composition";

import { isPromise } from "./promise";
import { reduce } from "./reduce";

export const map = (f) => (seq) => {
  const results = seq.map(f);
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
