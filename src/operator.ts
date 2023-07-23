export const letIn = <T>(value: T, constructor: (input: T) => unknown) =>
  constructor(value);
export const not = (x: boolean) => !x;
export const prop =
  <T, K extends keyof T>(key: K) =>
  (x: T) =>
    x[key];

type Primitive = number | string | null | undefined | boolean;
export const equals = (x: Primitive) => (y: Primitive) => x === y;
export const greater = (x: number) => (y: number) => y > x;
export const smaller = (x: number) => (y: number) => y < x;
export const greaterEquals = (x: number) => (y: number) => y >= x;
export const smallerEquals = (x: number) => (y: number) => y <= x;
export const between = (start: number, end: number) => (x: number) =>
  start <= x && x < end;
export const unspread = (...stuff: any[]) => stuff;
export const spread =
  <T extends any[]>(f: (...args: T) => unknown) =>
  (x: T) =>
    f(...x);
export const modulo = (y: number) => (x: number) => x % y;
