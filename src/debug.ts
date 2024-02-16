import { Func, ReturnTypeUnwrapped } from "./typing.ts";

import { currentLocation } from "./trace.ts";
import { pairRight } from "./juxt.ts";
import { pipe } from "./composition.ts";
import { isPromise } from "./promise.ts";

export const sideLog = <T>(x: T) => {
  console.log(currentLocation(3), x);
  return x;
};

export const logAround = <F extends Func>(f: F): F => {
  const codeLocation = currentLocation(3);
  return ((...xs) => {
    console.log(codeLocation, xs.length === 1 ? xs[0] : xs);
    const output = f(...xs);
    if (isPromise(output)) {
      return output.then((x) => {
        console.log(codeLocation, x);
        return x;
      }) as ReturnType<F>;
    }
    console.log(codeLocation, output);
    return output;
  }) as F;
};

export const logAfter = <F extends Func>(f: F): F => {
  const codeLocation = currentLocation(3);
  return ((...xs) => {
    const output = f(...xs);
    if (isPromise(output)) {
      return output.then((x) => {
        console.log(codeLocation, x);
        return x;
      }) as ReturnType<F>;
    }
    console.log(codeLocation, output);
    return output;
  }) as F;
};

export const logBefore = <F extends Func>(f: F): F => {
  const codeLocation = currentLocation(3);
  return ((...xs) => {
    console.log(codeLocation, xs.length === 1 ? xs[0] : xs);
    const output = f(...xs);
    if (isPromise(output)) {
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
    if (isPromise(result)) {
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

export const assert = <T>(
  condition: (_: T) => boolean | Promise<boolean>,
  errorMessage: string,
) =>
  pipe(
    pairRight(condition),
    ([value, passed]) => {
      if (!passed) throw new Error(errorMessage);
      return value;
    },
  );

export const coerce = <T>(x: T | undefined | null): T => {
  if (x === undefined || x === null) {
    throw new Error(`Got ${x} where value was expected.`);
  }
  return x;
};

type AugmentReturnType<F extends Func, T> = (
  ...inputs: Parameters<F>
) => ReturnType<F> | T;

export const tryCatch = <F extends Func, T>(
  f: F,
  fallback: (e: Error, ...xs: Parameters<F>) => T,
) =>
  ((...x: Parameters<F>) => {
    try {
      const result = f(...x);
      return isPromise(result)
        ? result.catch((e) => {
          return fallback(e, ...x);
        })
        : result;
    } catch (e) {
      return fallback(e, ...x);
    }
  }) as AugmentReturnType<F, T>;

export const catchWithNull = <F extends Func>(
  f: F,
): (...aruments: Parameters<F>) => ReturnType<F> | null =>
  tryCatch(f, () => null);
