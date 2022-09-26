import { after, pipe } from "./composition.js";

import { map } from "./map.js";
import { reduce } from "./reduce.js";
import { zip } from "./matrix.js";

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
