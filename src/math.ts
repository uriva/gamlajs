import { filter } from "./filter.ts";
import { juxt } from "./juxt.ts";
import { length } from "./array.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

const addition = (a: number, b: number): number => a + b;
export const sum: (xs: number[]) => number = reduce(addition, () => 0);
export const divide = (x: number) => (y: number): number => y / x;
export const times = (x: number) => (y: number): number => y * x;
export const average = (arr: number[]): number => sum(arr) / arr.length;
export const multiply = (x: number) => (y: number): number => x * y;

export const rate = <T>(f: (x: T) => boolean): (xs: T[]) => number =>
  pipe(
    juxt(pipe(filter(f), length), length),
    ([x, y]: [number, number]) => x / y,
  );
