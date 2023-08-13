import { Func } from "./typing.ts";

export const letIn = <T, Output>(value: T, constructor: (input: T) => Output) =>
  constructor(value);
// deno-lint-ignore no-explicit-any
export const not = (x: any) => !x;
export const prop = <T>() => <K extends keyof T>(key: K) => (x: T): T[K] =>
  x[key];

type Primitive = number | string | null | undefined | boolean;
export const equals = (x: Primitive) => (y: Primitive) => x === y;
export const greater = (x: number) => (y: number) => y > x;
export const smaller = (x: number) => (y: number) => y < x;
export const greaterEquals = (x: number) => (y: number) => y >= x;
export const smallerEquals = (x: number) => (y: number) => y <= x;
export const between = (start: number, end: number) => (x: number) =>
  start <= x && x < end;
export const unspread = <Inputs extends unknown[]>(...stuff: Inputs): Inputs =>
  stuff;
export const spread = <F extends Func>(f: F) => (x: Parameters<F>) => f(...x);
export const modulo = (y: number) => (x: number) => x % y;
