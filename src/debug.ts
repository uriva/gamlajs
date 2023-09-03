import { Func } from "./typing.ts";
import { sideEffect } from "./composition.ts";

export const sideLog = <T>(x: T) => {
  console.log(x);
  return x;
};

export const sideLogAfter = <F extends Func>(f: F): F =>
  ((...xs) => {
    const output = f(...xs);
    if (output instanceof Promise) {
      return output.then((x) => {
        console.log(x);
        return x;
      }) as ReturnType<F>;
    }
    console.log(output);
    return output;
  }) as F;

export const sideLogBefore = <F extends Func>(f: F): F =>
  ((...xs) => {
    console.log(xs.length === 1 ? xs[0] : xs);
    const output = f(...xs);
    if (output instanceof Promise) {
      return output.then((x) => {
        return x;
      }) as ReturnType<F>;
    }
    console.log(output);
    return output;
  }) as F;

export const sideLogTable = sideEffect(console.table);
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
