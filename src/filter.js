import { after, complement, pipe } from "./composition.js";
import { head, second } from "./array.js";

import { map } from "./map.js";
import { pairRight } from "./juxt.js";

export const filter = pipe(
  pairRight,
  map,
  after(pipe((array) => array.filter(second), map(head))),
);

export const find = (predicate) => pipe(filter(predicate), head);

export const remove = pipe(complement, filter);

const toContainmentCheck = (xs) => {
  const set = new Set(xs);
  return (k) => set.has(k);
};

export const intersectBy = (f) => (arrays) =>
  arrays.reduce((current, next) =>
    current.filter(pipe(f, toContainmentCheck(next.map(f)))),
  );
