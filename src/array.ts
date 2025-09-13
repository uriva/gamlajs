import { isPromise } from "./promise.ts";
import type { Func, IsAsync, ParamOf } from "./typing.ts";

const firstTrue = <T>(promises: Promise<T>[]) => {
  const newPromises = promises.map((p) =>
    new Promise(
      (resolve, reject) => p.then((v) => v && resolve(true), reject),
    )
  );
  newPromises.push(Promise.all(promises).then(() => false));
  return Promise.race(newPromises);
};

/** Check if any element passes a predicate (supports async). */
export const anymap =
  <F extends Func>(f: F) =>
  (xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<boolean>
    : boolean => {
    const promises = [];
    for (const x of xs) {
      const result = f(x);
      if (isPromise(result)) {
        promises.push(result);
        // @ts-expect-error cannot infer
      } else if (result) return true;
    }
    // @ts-expect-error cannot infer
    return (promises.length) ? firstTrue(promises) : false;
  };

/** True if any element is truthy.
 * @example any([0, 2, 0]) // true
 */
export const any = <T>(a: T[]): boolean =>
  a.some((x) => x as unknown as boolean);

/** Check if all elements pass a predicate (supports async). */
export const allmap =
  <F extends Func>(f: F) =>
  (xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<boolean>
    : boolean => {
    const promises = [];
    for (const x of xs) {
      const result = f(x);
      if (isPromise(result)) {
        promises.push(result);
        // @ts-expect-error cannot infer
      } else if (!result) return false;
    }
    // @ts-expect-error cannot infer
    return !promises.length ||
      firstTrue(promises.map((x) => x.then((x) => !x))).then((x) => !x);
  };

/** True if all elements are truthy.
 * @example all([1, 2]) // true
 */
export const all = <T>(a: T[]): boolean =>
  a.every((x) => x as unknown as boolean);
/** Join array values by a separator.
 * @example join(',')(["a","b"]) // 'a,b'
 */
export const join = (str: string) => (x: (string | number)[]): string =>
  x.join(str);
/** Array length.
 * @example length([1,2,3]) // 3
 */
export const length = <T>(array: T[]) => array.length;

export const uniqueBy = <T>(key: (x: T) => unknown) => (array: T[]): T[] => {
  const seen = new Set<unknown>();
  const result = [];
  for (const x of array) {
    const k = key(x);
    if (!seen.has(k)) {
      result.push(x);
      seen.add(k);
    }
  }
  return result;
};

/** Remove duplicates preserving order.
 * @example unique([1,1,2]) // [1,2]
 */
export const unique = <T>(array: T[]): T[] => Array.from(new Set(array));

/** Flatten one level of nested arrays.
 * @example concat([[1,2],[3]]) // [1,2,3]
 */
export const concat = <T>(array: T[][]): T[] => {
  const result = [];
  for (const xs of array) {
    for (const x of xs) {
      result.push(x);
    }
  }
  return result;
};

/** Return a reversed copy of an array.
 * @example reverse([1,2,3]) // [3,2,1]
 */
export const reverse = <T>(
  array: T[],
): T[] => array.slice().reverse();

/** All but first element.
 * @example tail([1,2,3]) // [2,3]
 */
export const tail = <T>(x: T[]): T[] => x.slice(1);
/** First element (or char). */
/** @example head([1,2,3]) // 1 */
// deno-lint-ignore no-explicit-any
export const head = <T extends (any[] | string)>(x: T): T[0] => x[0];
/** All but last element.
 * @example init([1,2,3]) // [1,2]
 */
export const init = <T>(x: T[]): T[] => x.slice(0, -1);
/** Second element (or char). */
/** @example second([1,2,3]) // 2 */
// deno-lint-ignore no-explicit-any
export const second = <T extends (any[] | string)>(x: T): T[1] => x[1];
/** Third element (or char). */
/** @example third([1,2,3]) // 3 */
// deno-lint-ignore no-explicit-any
export const third = <T extends (any[] | string)>(x: T): T[2] => x[2];
/** Last element.
 * @example last([1,2,3]) // 3
 */
export const last = <T>(x: T[]) => x[x.length - 1];
/** Is array empty?
 * @example empty([]) // true
 */
export const empty = <T>(x: T[]) => !x.length;
/** Is array non-empty?
 * @example nonempty([1]) // true
 */
export const nonempty = <T>(x: T[]) => !!x.length;
/** Wrap a value in a single-element array. */
/** @example wrapArray(5) // [5] */
export const wrapArray = <T>(x: T) => [x];

/** Zip arrays by index into tuples.
 * @example zip<[number,string]>([[1,2],["a","b"]]) // [[1,'a'],[2,'b']]
 */
export const zip = <Types extends unknown[]>(
  args: { [K in keyof Types]: Types[K][] },
): ({
  [K in keyof Types]: Types[K];
})[] =>
  range(0, Math.min(...args.map(length))).map((i) =>
    args.map((arr) => arr[i]) as { [K in keyof Types]: Types[K] }
  );

const compareArrays = <T extends Comparable>(a: T[], b: T[]) => {
  for (const [x, y] of zip([a, b])) {
    const result = comparator(x, y);
    if (result) return result;
  }
  return 0;
};

type Comparable = boolean | string | number | Comparable[];

const comparator = <T extends Comparable>(a: T, b: T): number =>
  typeof a === "boolean" && typeof b === "boolean"
    ? Number(a) - Number(b)
    : typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b)
    : typeof a === "number" && typeof b === "number"
    ? a - b
    : compareArrays(a as Comparable[], b as Comparable[]);

const castToInt = (x: number | boolean) =>
  x === true ? 1 : x === false ? -1 : x;

/** Sort with a custom comparator that can return boolean or number.
 * @example sortCompare<number>((a,b)=>a-b)([2,1]) // [1,2]
 */
export const sortCompare =
  <X>(comparator: (x: X, y: X) => number | boolean) => (xs: X[]): X[] =>
    xs.slice().sort((x, y) => castToInt(comparator(x, y)));

/** Sort values of comparable primitives or nested arrays.
 * @example sort([3,1,2]) // [1,2,3]
 */
export function sort<X extends Comparable>(xs: X[]): X[] {
  return sortCompare<X>(comparator as (x: X, y: X) => number)(xs);
}

/** Sort by a key function (supports async key).
 * @example sortKey((x:{v:number})=>x.v)([{v:2},{v:1}]) // [{v:1},{v:2}]
 */
export const sortKey = <F extends Func>(
  key: F & ((x: ParamOf<F>) => Comparable | Promise<Comparable>),
) =>
(xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<ParamOf<F>[]>
  : ParamOf<F>[] => {
  const keys = xs.map(key);
  const hasPromise = keys.some(isPromise);
  // @ts-ignore location of error in node
  return hasPromise
    // @ts-ignore cannot infer conditional return type (location of error in deno)
    ? Promise.all(keys).then(
      (resolvedKeys) => {
        const paired = xs.map((x, i) => ({ x, key: resolvedKeys[i] }));
        paired.sort((p, q) => castToInt(comparator(p.key, q.key)));
        return paired.map((p) => p.x);
      },
    )
    // @ts-ignore cannot infer conditional return type (location of error in deno)
    : sortCompare<ParamOf<F>>((a, b) => comparator(key(a), key(b)))(xs);
};

/** Create array [start..end).
 * @example range(0,3) // [0,1,2]
 */
export const range = (start: number, end: number): number[] => {
  const result = [];
  for (let i = start; i < end; i++) result.push(i);
  return result;
};

/** Inclusion checks.
 * @example contains(2)([1,2,3]) // true
 */
export const contains = <T>(x: T) => (array: T[]): boolean => array.includes(x);
export const includedIn = <T>(array: T[]) => (x: T): boolean =>
  array.includes(x);

/** Take first n elements.
 * @example take(2)([1,2,3]) // [1,2]
 */
export const take = <T>(n: number) => (xs: T[]): T[] => xs.slice(0, n);

/** Random sample of n elements without replacement.
 * @example sample(2)([1,2,3]).length // 2
 */
export const sample = <T>(n: number) => (xs: T[]): T[] =>
  xs.slice()
    .map((value, index) => [Math.random(), value, index] as [number, T, number])
    .sort(([a], [b]) => a - b)
    .slice(0, Math.min(n, xs.length))
    .map(([, value]) => value);

/** Drop first n elements.
 * @example drop(1)([1,2,3]) // [2,3]
 */
export const drop = <T>(n: number) => (xs: T[]): T[] => xs.slice(n);

/** Pair elements with their index.
 * @example enumerate(['a','b']) // [[0,'a'],[1,'b']]
 */
export const enumerate = <T>(xs: T[]): [number, T][] =>
  xs.map((x, i) => [i, x]);

/** Sliding windows of length l.
 * @example slidingWindow(2)([1,2,3]) // [[1,2],[2,3]]
 */
export const slidingWindow = <T>(l: number) => (xs: T[]): T[][] =>
  xs.flatMap((_, i) => (i <= xs.length - l ? [xs.slice(i, i + l)] : []));

/** Append element to end.
 * @example append(3)([1,2]) // [1,2,3]
 */
export const append = <T>(element: T) => (arr: T[]) => [...arr, element];

/** Prepend element to start.
 * @example prepend(0)([1,2]) // [0,1,2]
 */
export const prepend = <T>(element: T) => (arr: T[]) => [element, ...arr];

/** Fisher–Yates shuffle copy.
 * @example shuffle([1,2,3]).length // 3
 */
export const shuffle = <T>(array: T[]): T[] => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
