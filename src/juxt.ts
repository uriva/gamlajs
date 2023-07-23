import { after, pipe } from "./composition.ts";
import { all, any, zip } from "./array.ts";

import { map } from "./map.ts";
import { reduce } from "./reduce.ts";

export const juxt =
  <Args extends any[]>(...fs: ((...args: Args) => any)[]) =>
  (...x: Args) =>
    map((f: (...args: Args) => any) => f(...x))(fs);

export const pairRight = (f: (...args: any[]) => any) => juxt((x) => x, f);
export const stack = (...functions: ((x: any) => any)[]) =>
  pipe(
    (values: any[]) => zip(functions, values),
    map(([f, x]: [(x: any) => any, any]) => f(x)),
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
