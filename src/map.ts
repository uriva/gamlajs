import { AsyncFunction, Unary } from "./typing.ts";

import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

// deno-lint-ignore no-explicit-any
export const map = <Function extends (_: any) => any>(f: Function) =>
(
  xs: Parameters<Function>[0][],
): Function extends AsyncFunction ? Promise<Awaited<ReturnType<Function>>[]>
  : ReturnType<Function>[] => {
  const results = [];
  for (const x of xs) {
    results.push(f(x));
  }
  // @ts-expect-error ts cannot reason about this dynamic ternary
  return (results.some((x) => x instanceof Promise)
    ? Promise.all(results)
    : results);
};

export const mapCat = <T, G>(
  f: Unary<T, G>,
) =>
(x: T[]): G => pipe(map(f), reduce((a, b) => a.concat(b), () => []))(x);
