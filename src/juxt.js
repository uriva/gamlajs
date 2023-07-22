import { after, pipe } from "./composition.js";
import { all, any, zip } from "./array.ts";

import { map } from "./map.js";
import { reduce } from "./reduce.ts";

export const juxt =
  (...fs) =>
  (...x) =>
    map((f) => f(...x))(fs);

export const pairRight = (f) => juxt((x) => x, f);
export const stack = (...functions) =>
  pipe(
    (values) => zip(functions, values),
    map(([f, x]) => f(x)),
  );

export const juxtCat = pipe(
  juxt,
  after(
    reduce(
      (a, b) => a.concat(b),
      () => [],
    ),
  ),
);

export const alljuxt = pipe(juxt, after(all));
export const anyjuxt = pipe(juxt, after(any));
