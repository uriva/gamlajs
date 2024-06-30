import { AsyncFunction, Unary, UnaryFnUntyped } from "./typing.ts";

import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";
import { isPromise } from "./promise.ts";

export const map = <F extends UnaryFnUntyped>(f: F) =>
(
  xs: Parameters<F>[0][],
): F extends AsyncFunction ? Promise<Awaited<ReturnType<F>>[]>
  : ReturnType<F>[] => {
  const results = [];
  for (const x of xs) {
    results.push(f(x));
  }
  // @ts-expect-error ts cannot reason about this dynamic ternary
  return results.some(isPromise) ? Promise.all(results) : results;
};

export const each = <F extends UnaryFnUntyped>(f: F) =>
// @ts-expect-error ts cannot reason about this
(xs: Parameters<F>[0][]): F extends AsyncFunction ? Promise<void> : void => {
  const results = [];
  for (const x of xs) {
    const result = f(x);
    if (isPromise(result)) results.push(result);
  }
  // @ts-expect-error ts cannot reason about this dynamic ternary
  if (results.length) return Promise.all(results).then();
};

export const mapCat = <T, G>(
  f: Unary<T, G>,
) =>
// @ts-expect-error ts cannot reason about this
(x: T[]): G => pipe(map(f), reduce((a, b) => a.concat(b), () => []))(x);
