import type { Func } from "./typing.ts";

/** Bind a value into a constructor function. */
export const letIn = <T, Output>(
  value: T,
  constructor: (input: T) => Output,
): Output => constructor(value);
/** Logical NOT. */
export const not = (x: unknown): boolean => !x;
// Why prop is written like this: https://chatgpt.com/share/447fc150-948e-4f45-83f7-3ef9410affdd
/** Get property by key. @example prop<{a:number}>()('a')({a:1}) // 1 */
export const prop = <T>() => <K extends keyof T>(key: K) => (x: T): T[K] =>
  x[key];

/** Strict equality. */
export const equals = <T>(x: T) => (y: T): boolean => x === y;
/** y > x (curried). */
export const greater = (x: number) => (y: number): boolean => y > x;
/** y < x (curried). */
export const smaller = (x: number) => (y: number): boolean => y < x;
/** y >= x (curried). */
export const greaterEquals = (x: number) => (y: number): boolean => y >= x;
/** y <= x (curried). */
export const smallerEquals = (x: number) => (y: number): boolean => y <= x;
/** start <= x < end */
export const between = (start: number, end: number) => (x: number): boolean =>
  start <= x && x < end;
/** Pack variadic arguments into a tuple. */
export const unspread = <Inputs extends unknown[]>(...stuff: Inputs): Inputs =>
  stuff;
/** Spread a tuple into a function call. */
export const spread =
  <F extends Func>(f: F) => (x: Parameters<F>): ReturnType<F> =>
    f(...x) as ReturnType<F>;
/** x % y (curried as modulo(y)(x)). */
export const modulo = (y: number) => (x: number): number => x % y;
