import { after, pipe } from "./composition.ts";
import { all, any, zip } from "./array.ts";

import { map } from "./map.ts";
import { reduce } from "./reduce.ts";

export const juxt =
  <Args extends any[], Output>(...fs: ((..._: Args) => unknown)[]) =>
  (...x: Args) =>
    map((f: (..._: Args) => unknown) => f(...x))(fs) as Output;

export const pairRight = <T, Output>(
  f: (_: T) => any,
): ((_: T) => [T, Output]) => juxt((x) => x, f);
export const stack = (...functions: ((x: any) => any)[]) =>
  pipe(
    (values: any[]) => zip(functions, values),
    map(([f, x]: [(x: any) => any, any]) => f(x)),
  );
export const juxtCat = pipe(
  juxt,
  after(
    reduce<any[], any[], false>(
      (a: any[], b: any[]) => a.concat(b),
      () => [],
    ),
  ),
);

export const alljuxt = pipe(juxt, after(all));
export const anyjuxt = pipe(juxt, after(any));
