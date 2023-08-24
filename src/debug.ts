import { sideEffect } from "./composition.ts";

export const log = sideEffect(console.log);
export const logTable = sideEffect(console.table);
// deno-lint-ignore no-explicit-any
export const logWith = <T>(...x: any[]) =>
  sideEffect<T>((y) => console.log(...x, y));

const getTimestampMilliseconds = () => new Date().getTime();

export const asyncTimeit = <Args extends unknown[], R>(
  handler: (time: number, args: Args, result: R) => void,
  f: (..._: Args) => R,
) =>
async (...args: Args) => {
  const started = getTimestampMilliseconds();
  const result = await f(...args);
  handler(getTimestampMilliseconds() - started, args, result);
  return result;
};

export const timeit = <Args extends unknown[], R>(
  handler: (time: number, args: Args, result: R) => void,
  f: (..._: Args) => R,
) =>
(...args: Args) => {
  const started = getTimestampMilliseconds();
  const result = f(...args);
  handler(getTimestampMilliseconds() - started, args, result);
  return result;
};

export const assert = <T>(condition: (_: T) => boolean, errorMessage: string) =>
  sideEffect((x: T) => {
    if (!condition(x)) throw new Error(errorMessage);
  });
