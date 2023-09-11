export const anymap = <X>(f: (x: X) => boolean) => (xs: X[]) => xs.some(f);
export const any = <T>(a: T[]) => a.some((x) => x);
export const allmap = <X>(f: (x: X) => boolean) => (xs: X[]) => xs.every(f);
export const all = <T>(a: T[]) => a.every((x) => x);
export const join = (str: string) => (x: (string | number)[]) => x.join(str);
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

export const unique = <T>(array: T[]) => Array.from(new Set(array));

export const concat = <T>(array: T[][]) => {
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

export const tail = <T>(x: T[]) => x.slice(1);
// deno-lint-ignore no-explicit-any
export const head = <T extends (any[] | string)>(x: T): T[0] => x[0];
export const init = <T>(x: T[]) => x.slice(0, -1);
// deno-lint-ignore no-explicit-any
export const second = <T extends (any[] | string)>(x: T): T[1] => x[1];
// deno-lint-ignore no-explicit-any
export const third = <T extends (any[] | string)>(x: T): T[2] => x[2];
export const last = <T>(x: T[]) => x[x.length - 1];
export const empty = <T>(x: T[]) => !x.length;
export const nonempty = <T>(x: T[]) => !!x.length;
export const wrapArray = <T>(x: T) => [x];

export const zip = <T extends unknown[][]>(
  ...args: T
): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] =>
  // @ts-expect-error This is too much for ts
  range(0, Math.min(...args.map(length))).map((i) => args.map((arr) => arr[i]));

const compareArrays = <T extends Comparable>(a: T[], b: T[]) => {
  for (const [x, y] of zip(a, b)) {
    const result = comparator(x, y);
    if (result) return result;
  }
  return 0;
};

type Comparable = string | number | Comparable[];

const comparator = <T extends Comparable>(a: T, b: T): number => {
  return typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b)
    : typeof a === "number" && typeof b === "number"
    ? a - b
    : compareArrays(a as Comparable[], b as Comparable[]);
};

const castToInt = (x: number | boolean) =>
  x === true ? 1 : x === false ? -1 : x;

export const sortCompare =
  <X>(comparator: (x: X, y: X) => number | boolean) => (xs: X[]) =>
    xs.slice().sort((x, y) => castToInt(comparator(x, y)));

export const sort = sortCompare(comparator);

export const sortKey = <X>(key: (_: X) => Comparable) =>
  sortCompare<X>((a, b) => comparator(key(a), key(b)));

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) result.push(i);
  return result;
};

export const contains = <T>(x: T) => (array: T[]) => array.includes(x);
export const includedIn = <T>(array: T[]) => (x: T) => array.includes(x);

export const take = <T>(n: number) => (xs: T[]) => xs.slice(0, n);
export const drop = <T>(n: number) => (xs: T[]) => xs.slice(n);

export const enumerate = <T>(xs: T[]) => xs.map((x, i) => [i, x]);

export const slidingWindow = <T>(l: number) => (xs: T[]) =>
  xs.flatMap((_, i) => (i <= xs.length - l ? [xs.slice(i, i + l)] : []));
