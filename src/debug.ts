import type {
  AsyncFunction,
  Func,
  IsAsync,
  ParamOf,
  ReturnTypeUnwrapped,
} from "./typing.ts";
import { pipe, sideEffect } from "./composition.ts";
import { pairRight } from "./juxt.ts";
import { isPromise } from "./promise.ts";
import { currentLocation } from "./trace.ts";
import { letIn } from "./operator.ts";

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
    elapsedMilliseconds: number,
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

export const assert = <F extends Func>(
  condition: F,
  errorMessage: string,
): true extends IsAsync<F> ? ((t: ParamOf<F>) => Promise<ParamOf<F>>)
  : ((t: ParamOf<F>) => ParamOf<F>) =>
  // @ts-expect-error not sure
  pipe(
    // @ts-expect-error not sure
    pairRight(condition),
    ([value, passed]: [ParamOf<F>, boolean]) => {
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
) => ReturnType<F> | (true extends IsAsync<F> ? Promise<Awaited<T>> : T);

export const tryCatch = <F extends Func, T>(
  f: F,
  fallback: (e: Error, ...xs: Parameters<F>) => T,
) =>
  ((...x: Parameters<F>) => {
    try {
      const result = f(...x);
      return isPromise(result)
        ? result.catch((e) => fallback(e, ...x))
        : result;
    } catch (e) {
      return fallback(e as Error, ...x);
    }
  }) as AugmentReturnType<F, T>;

export const catchWithNull = <F extends Func>(f: F) => tryCatch(f, () => null);

export const catchErrorWithId = (id: string) =>
// deno-lint-ignore no-explicit-any
<F extends AsyncFunction, G extends (...args: Parameters<F>) => any>(
  fallback: G,
  f: F,
): (...args: Parameters<F>) => ReturnType<F> | ReturnType<G> =>
// @ts-expect-error cannot infer
async (...xs: Parameters<F>) => {
  try {
    return await f(...xs);
  } catch (e) {
    // @ts-ignore-error This code has a distinct type of `Error` (doesn't trigger in node)
    if (e.id === id) return fallback(...xs);
    throw e;
  }
};

const makeErrorWithId = (id: string) => {
  const err = new Error();
  // @ts-expect-error changes the typing of `Error`
  err.id = id;
  return err;
};

export const throwerCatcher = () => {
  const id = crypto.randomUUID();
  const catcher = catchErrorWithId(id);
  const thrower = () => {
    throw makeErrorWithId(id);
  };
  return [thrower, catcher] as [typeof thrower, typeof catcher];
};

export const catchErrorWithIdAndValue = <T>(id: string) =>
// deno-lint-ignore no-explicit-any
<F extends AsyncFunction, G extends (value: T) => any>(
  fallback: G,
  f: F,
): (...args: Parameters<F>) => ReturnType<F> | ReturnType<G> =>
// @ts-expect-error cannot infer
async (...xs: Parameters<F>) => {
  try {
    return await f(...xs);
  } catch (e) {
    // @ts-ignore-error This code has a distinct type of `Error` (doesn't trigger in node)
    if (e.id === id) return fallback(e.payload);
    throw e;
  }
};

export const throwerCatcherWithValue = <T>() => {
  const id = crypto.randomUUID();
  const catcher = catchErrorWithIdAndValue<T>(id);
  const thrower = (value: T) => {
    const e = makeErrorWithId(id);
    // @ts-expect-error This code has a distinct type of `Error`
    e.payload = value;
    throw e;
  };
  return [thrower, catcher] as [typeof thrower, typeof catcher];
};
