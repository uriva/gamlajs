export const anymap =
  <X>(f: (x: X) => boolean) =>
  (xs: X[]) =>
    xs.some(f);
const identity = (x: any) => x;
export const any = anymap(identity);
export const allmap =
  <X>(f: (x: X) => boolean) =>
  (xs: X[]) =>
    xs.every(f);
export const all = allmap(identity);
export const join = (str: string) => (x: string[]) => x.join(str);

type Primitive = string | number | null;

export const length = (array: any[]) => array.length;
export const unique =
  <T>(key: (x: T) => Primitive) =>
  (array: T[]) => {
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

export const concat = (array: any[][]) => {
  const result = [];
  for (const xs of array) {
    for (const x of xs) {
      result.push(x);
    }
  }
  return result;
};

export const reverse = (array: any[]) => array.slice().reverse();
export const tail = (x: any[]) => x.slice(1);
export const head = (x: any[]) => x[0];
export const init = (x: any[]) => x.slice(0, -1);
export const second = (x: any[]) => x[1];
export const third = (x: any[]) => x[2];
export const last = (x: any[]) => x[x.length - 1];
export const empty = (x: any[]) => !x.length;
export const nonempty = (x: any[]) => !!x.length;
export const wrapArray = (x: any) => [x];

// Zips arrays by the length of the first.
export const zip = (...arrays: any[][]) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));

const compareArrays = <T extends Comparable>(a: T[], b: T[]) => {
  for (const [x, y] of zip(a, b)) {
    const result = comparator(x, y);
    if (result) return result;
  }
  return 0;
};

type Comparable = string | number | Comparable[];

function comparator(a: Comparable, b: Comparable): number;
function comparator(a: any, b: any): number {
  return typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b)
    : typeof a === "number" && typeof b === "number"
    ? a - b
    : compareArrays(a, b);
}

const castToInt = (x: number | boolean) =>
  x === true ? 1 : x === false ? -1 : x;

export const sortCompare =
  <X>(comparator: (x: X, y: X) => number | boolean) =>
  (xs: X[]) =>
    xs.slice().sort((x, y) => castToInt(comparator(x, y)));

export const sort = sortCompare(comparator);

export const sortKey = <X>(key: (x: X) => Comparable) =>
  sortCompare<X>((a, b) => comparator(key(a), key(b)));

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) result.push(i);
  return result;
};

export const contains =
  <T>(x: T) =>
  (array: T[]) =>
    array.includes(x);
export const includedIn =
  <T>(array: T[]) =>
  (x: T) =>
    array.includes(x);

export const take = (n: number) => (xs: any[]) => xs.slice(0, n);
export const drop = (n: number) => (xs: any[]) => xs.slice(n);

export const enumerate = (xs: any[]) => xs.map((x, i) => [i, x]);

export const slidingWindow = (l: number) => (xs: any[]) =>
  xs.flatMap((_, i) => (i <= xs.length - l ? [xs.slice(i, i + l)] : []));