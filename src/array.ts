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

export const any = <T>(a: T[]): boolean =>
  a.some((x) => x as unknown as boolean);

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

export const all = <T>(a: T[]): boolean =>
  a.every((x) => x as unknown as boolean);
export const join = (str: string) => (x: (string | number)[]): string =>
  x.join(str);
export const length = <T>(array: T[]) => array.length;

// deno-lint-ignore no-explicit-any
export const uniqueBy = <T>(key: (x: T) => any) => (array: T[]): T[] => {
  const seen = new Set();
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

export const unique = <T>(array: T[]): T[] => Array.from(new Set(array));

export const concat = <T>(array: T[][]): T[] => {
  const result = [];
  for (const xs of array) {
    for (const x of xs) {
      result.push(x);
    }
  }
  return result;
};

export const reverse = <T>(
  array: T[],
): T[] => array.slice().reverse();

export const tail = <T>(x: T[]): T[] => x.slice(1);
// deno-lint-ignore no-explicit-any
export const head = <T extends (any[] | string)>(x: T): T[0] => x[0];
export const init = <T>(x: T[]): T[] => x.slice(0, -1);
// deno-lint-ignore no-explicit-any
export const second = <T extends (any[] | string)>(x: T): T[1] => x[1];
// deno-lint-ignore no-explicit-any
export const third = <T extends (any[] | string)>(x: T): T[2] => x[2];
export const last = <T>(x: T[]) => x[x.length - 1];
export const empty = <T>(x: T[]) => !x.length;
export const nonempty = <T>(x: T[]) => !!x.length;
export const wrapArray = <T>(x: T) => [x];

// deno-lint-ignore no-explicit-any
export const zip = <Types extends any[]>(
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

export const sortCompare =
  <X>(comparator: (x: X, y: X) => number | boolean) => (xs: X[]): X[] =>
    xs.slice().sort((x, y) => castToInt(comparator(x, y)));

export function sort<X extends Comparable>(xs: X[]): X[] {
  return sortCompare<X>(comparator as (x: X, y: X) => number)(xs);
}

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

export const range = (start: number, end: number): number[] => {
  const result = [];
  for (let i = start; i < end; i++) result.push(i);
  return result;
};

export const contains = <T>(x: T) => (array: T[]): boolean => array.includes(x);
export const includedIn = <T>(array: T[]) => (x: T): boolean =>
  array.includes(x);

export const take = <T>(n: number) => (xs: T[]): T[] => xs.slice(0, n);

export const sample = <T>(n: number) => (xs: T[]): T[] =>
  xs.slice()
    .map((value, index) => [Math.random(), value, index] as [number, T, number])
    .sort(([a], [b]) => a - b)
    .slice(0, Math.min(n, xs.length))
    .map(([, value]) => value);

export const drop = <T>(n: number) => (xs: T[]): T[] => xs.slice(n);

export const enumerate = <T>(xs: T[]): [number, T][] =>
  xs.map((x, i) => [i, x]);

export const slidingWindow = <T>(l: number) => (xs: T[]): T[][] =>
  xs.flatMap((_, i) => (i <= xs.length - l ? [xs.slice(i, i + l)] : []));

export const append = <T>(element: T) => (arr: T[]) => [...arr, element];

export const prepend = <T>(element: T) => (arr: T[]) => [element, ...arr];

export const shuffle = <T>(array: T[]): T[] => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
