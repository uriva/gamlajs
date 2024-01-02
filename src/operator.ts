import { Func } from "./typing.ts";

export const letIn = <T, Output>(value: T, constructor: (input: T) => Output) =>
  constructor(value);
// deno-lint-ignore no-explicit-any
export const not = (x: any) => !x;
export const prop = <T>() => <K extends keyof T>(key: K) => (x: T): T[K] =>
  x[key];

export const equals = <T>(x: T) => (y: T) => x === y;
export const greater = (x: number) => (y: number) => y > x;
export const smaller = (x: number) => (y: number) => y < x;
export const greaterEquals = (x: number) => (y: number) => y >= x;
export const smallerEquals = (x: number) => (y: number) => y <= x;
export const between = (start: number, end: number) => (x: number) =>
  start <= x && x < end;
// deno-lint-ignore no-explicit-any
export const unspread = <Inputs extends any[]>(...stuff: Inputs): Inputs =>
  stuff;
export const spread = <F extends Func>(f: F) => (x: Parameters<F>) =>
  f(...x) as ReturnType<F>;
export const modulo = (y: number) => (x: number) => x % y;
