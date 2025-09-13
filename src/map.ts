import type { IsAsync, Unary, UnaryFnUntyped } from "./typing.ts";
import { errorBoundry, pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";
import { isPromise } from "./promise.ts";

const mapWithoutStack = <F extends UnaryFnUntyped>(f: F) =>
(
  xs: Parameters<F>[0][],
): true extends IsAsync<F> ? Promise<Awaited<ReturnType<F>>[]>
  : ReturnType<F>[] => {
  const results = [];
  for (const x of xs) {
    results.push(f(x));
  }
  // @ts-expect-error ts cannot reason about this dynamic ternary
  return results.some(isPromise) ? Promise.all(results) : results;
};

/**
 * Map over an array with a function, auto-flattening Promises.
 * @example
 * await map(async (x:number)=>x+1)([1,2]) // [2,3]
 */
export const map: typeof mapWithoutStack = (...fs) =>
  errorBoundry(mapWithoutStack(...fs));

/**
 * Run a function for each element (collects pending Promises if returned).
 * @example
 * await each(async (x:number)=>console.log(x))([1,2])
 */
export const each = <F extends UnaryFnUntyped>(f: F) =>
(
  xs: Parameters<F>[0][],
): true extends IsAsync<F> ? Promise<void> : void => {
  const results = [];
  for (const x of xs) {
    const result = f(x);
    if (isPromise(result)) results.push(result);
  }
  if (results.length) {
    return Promise.all(results).then() as unknown as true extends IsAsync<F>
      ? Promise<void>
      : void;
  }
  return undefined as unknown as true extends IsAsync<F> ? Promise<void> : void;
};

/**
 * Map and flatten one level (map then concat).
 * @example
 * mapCat((x:number)=>[x,x])([1,2]) // [1,1,2,2]
 */
export const mapCat = <T, G>(f: Unary<T, G>) => (x: T[]): G =>
  pipe(map(f), reduce((a, b) => a.concat(b), () => []))(x);
