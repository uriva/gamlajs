import { filter } from "./filter.ts";
import { juxt } from "./juxt.ts";
import { length } from "./array.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

const addition = (a: number, b: number): number => a + b;
/** Sum an array of numbers. @example sum([1,2,3]) // 6 */
export const sum: (xs: number[]) => number = reduce(addition, () => 0);
/** Divide y by x (curried). @example divide(2)(10) // 5 */
export const divide = (x: number) => (y: number): number => y / x;
/** Multiply y by x (curried). @example times(2)(10) // 20 */
export const times = (x: number) => (y: number): number => y * x;
/** Average of an array. @example average([2,4]) // 3 */
export const average = (arr: number[]): number => sum(arr) / arr.length;
/** Multiply two numbers (alias). @example multiply(3)(4) // 12 */
export const multiply = (x: number) => (y: number): number => x * y;

/**
 * Fraction of items matching a predicate.
 * @example
 * rate(x => x > 0)([1,-1,2]) // 2/3
 */
export const rate = <T>(f: (x: T) => boolean): (xs: T[]) => number =>
  pipe(
    juxt(pipe(filter(f), length), length),
    ([x, y]: [number, number]) => x / y,
  );
