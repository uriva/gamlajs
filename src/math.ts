import { filter } from "./filter.ts";
import { juxt } from "./juxt.ts";
import { length } from "./array.ts";
import { pipe } from "./composition.js";
import { reduce } from "./reduce.js";

export const sum = reduce<number, number>(
  (a: number, b: number) => a + b,
  () => 0,
);
export const divide = (x: number) => (y: number) => y / x;
export const times = (x: number) => (y: number) => y * x;
export const average = (arr: number[]) => sum(arr) / arr.length;
export const multiply = (x: number) => (y: number) => x * y;

export const rate = <T>(f: (x: T) => boolean) =>
  pipe(
    juxt(pipe(filter(f), length), length),
    ([x, y]: [number, number]) => x / y,
  );
