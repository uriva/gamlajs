import { after, pipe } from "./composition";

import { map } from "./map";
import { reduce } from "./reduce";
import { zip } from "./array";

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
