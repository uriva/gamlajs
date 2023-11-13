import { Func, ReturnTypeUnwrapped } from "./typing.ts";

import { currentLocation } from "./trace.ts";
import { sideEffect } from "./composition.ts";

export const sideLog = <T>(x: T) => {
  console.log(currentLocation(3), x);
  return x;
};

export const sideLogAfter = <F extends Func>(f: F): F => {
  const codeLocation = currentLocation(3);
  return ((...xs) => {
    const output = f(...xs);
    if (output instanceof Promise) {
      return output.then((x) => {
        console.log(codeLocation, x);
        return x;
      }) as ReturnType<F>;
    }
    console.log(codeLocation, output);
    return output;
  }) as F;
};

export const sideLogBefore = <F extends Func>(f: F): F => {
  const codeLocation = currentLocation(3);
  return ((...xs) => {
    console.log(codeLocation, xs.length === 1 ? xs[0] : xs);
    const output = f(...xs);
    if (output instanceof Promise) {
      return output.then((x) => {
        return x;
      }) as ReturnType<F>;
    }
    return output;
  }) as F;
};

const getTimestampMilliseconds = () => new Date().getTime();

export const timeit = <F extends Func>(
  handler: (
    elapsed: number,
    args: Parameters<F>,
    result: ReturnTypeUnwrapped<F>,
  ) => void,
  f: F,
): F =>
  ((...x: Parameters<F>) => {
    const started = getTimestampMilliseconds();
    const result = f(...x);
    if (result instanceof Promise) {
      return result.then((result) => {
        const elapsed = getTimestampMilliseconds() - started;
        handler(elapsed, x, result);
        return result;
      });
    }
    const elapsed = getTimestampMilliseconds() - started;
    handler(elapsed, x, result);
    return result;
  }) as F;

export const assert = <T>(condition: (_: T) => boolean, errorMessage: string) =>
  sideEffect((x: T) => {
    if (!condition(x)) throw new Error(errorMessage);
  });
