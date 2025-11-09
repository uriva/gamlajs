// (no-op)
import { isPromise } from "./promise.ts";
import { currentLocation } from "./trace.ts";
import type {
  EitherOutput,
  Func,
  IsAsync,
  ParamOf,
  ReturnTypeUnwrapped,
} from "./typing.ts";

/** Log value with code location and return it. */
export const sideLog = <T>(x: T): T => {
  console.log(currentLocation(3), x);
  return x;
};

/** Log JSONified value with code location and return it. */
export const sideLogJson = <T>(x: T): T => {
  console.log(currentLocation(3), JSON.stringify(x, null, 2));
  return x;
};

/** Log inputs and outputs of a function. */
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

/** Log the output of a function. */
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

/** Log the input of a function. */
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

/** Measure and report execution time of a function. */
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
        const r = result as ReturnTypeUnwrapped<F>;
        handler(elapsed, x, r);
        return r as unknown as ReturnType<F>;
      });
    }
    const elapsed = getTimestampMilliseconds() - started;
    handler(elapsed, x, result);
    return result;
  }) as F;

/** Ensure condition holds; throw with message otherwise. */
export const assert = <F extends Func>(
  condition: F,
  errorMessage: string,
): true extends IsAsync<F> ? ((t: ParamOf<F>) => Promise<ParamOf<F>>)
  : ((t: ParamOf<F>) => ParamOf<F>) =>
  (
    (x: ParamOf<F>) => {
      const result = condition(x);
      if (isPromise(result)) {
        return result.then((passed) => {
          if (!passed) throw new Error(errorMessage);
          return x;
        }) as unknown as true extends IsAsync<F> ? Promise<ParamOf<F>>
          : ParamOf<F>;
      }
      if (!result) throw new Error(errorMessage);
      return x as true extends IsAsync<F> ? Promise<ParamOf<F>> : ParamOf<F>;
    }
  ) as true extends IsAsync<F> ? ((t: ParamOf<F>) => Promise<ParamOf<F>>)
    : ((t: ParamOf<F>) => ParamOf<F>);

/** Throw if value is nullish, otherwise return it. */
export const coerce = <T>(x: T | undefined | null): T => {
  if (x === undefined || x === null) {
    throw new Error(`Got ${x} where value was expected.`);
  }
  return x;
};

type AugmentReturnType<F extends Func, T> = true extends IsAsync<F> ? (
    ...inputs: Parameters<F>
  ) => Promise<Awaited<ReturnType<F>> | Awaited<T>>
  : (
    ...inputs: Parameters<F>
  ) => ReturnType<F> | T;

/** Wrap a function with a fallback on exception; supports async. */
// Overloads keep fallback parameters strictly correlated with the wrapped function
// Put the simpler overload first to avoid ambiguous inference when fallback ignores args
export function tryCatch<T>(
  fallback: (e: Error) => T,
): <F extends Func>(f: F) => AugmentReturnType<F, T>;
export function tryCatch<T, P extends unknown[]>(
  fallback: (e: Error, ...xs: P) => T,
): <F extends (...args: P) => unknown>(f: F) => AugmentReturnType<F, T>;
// Implementation
export function tryCatch<T>(
  // deno-lint-ignore no-explicit-any
  fallback: ((e: Error, ...xs: any[]) => T) | ((e: Error) => T),
) {
  return function <F extends Func>(f: F): AugmentReturnType<F, T> {
    return ((...x: Parameters<F>) => {
      try {
        const result = f(...x);
        return isPromise(result)
          ? result.catch((e: Error) =>
            (fallback as (
              e: Error,
              ...xs: Parameters<F>
            ) => T)(e, ...x)
          )
          : result;
      } catch (e) {
        return (fallback as (e: Error, ...xs: Parameters<F>) => T)(
          e as Error,
          ...x,
        );
      }
    });
  };
}

/** Return null when function throws; works with async. */
export const catchWithNull = <F extends Func>(f: F) =>
  tryCatch<null>(() => null)(f) as (
    ...args: Parameters<F>
  ) => ReturnType<F> | Promise<Awaited<ReturnType<F>> | null>;

const makeErrorWithId = (id: string) => {
  const err = new Error();
  // @ts-expect-error changes the typing of `Error`
  err.id = id;
  return err;
};

const handleAsyncOrSyncException = <T, E, F extends Func>(
  f: F,
  params: Parameters<F>,
  onExcept: (e: E) => T,
) => {
  try {
    const result = f(...params);
    if (isPromise(result)) {
      return result.catch(onExcept);
    }
    return result;
  } catch (e) {
    // @ts-ignore does not trigger in node
    return onExcept(e);
  }
};

const catchErrorWithIdAndValue =
  <T>(id: string) =>
  <G extends (value: T) => unknown>(fallback: G) =>
  <F extends Func>(f: F) =>
  (...xs: Parameters<F>): EitherOutput<F, G> =>
    handleAsyncOrSyncException(
      f,
      xs,
      (e: Error & { id: string; payload: T }) => {
        if (e.id === id) return fallback(e.payload);
        throw e;
      },
    );

const catchErrorWithId =
  (id: string) =>
  <G extends Func>(fallback: G) =>
  <F extends Func>(f: F) =>
  (...xs: Parameters<F>): EitherOutput<F, G> =>
    handleAsyncOrSyncException(f, xs, (e: Error & { id: string }) => {
      if (e.id === id) return fallback(...xs, e);
      throw e;
    });

export const throwerCatcher: () => {
  thrower: () => never;
  catcher: <G extends Func>(
    fallback: G,
  ) => <F extends Func>(f: F) => (
    ...xs: Parameters<F>
  ) => EitherOutput<F, G>;
} = () => {
  const id = crypto.randomUUID();
  const catcher = catchErrorWithId(id);
  const thrower = () => {
    throw makeErrorWithId(id);
  };
  return { thrower, catcher };
};

export const throwerCatcherWithValue = <T>(): {
  thrower: (value: T) => never;
  catcher: <G extends (value: T) => unknown>(
    fallback: G,
  ) => <F extends Func>(f: F) => (
    ...xs: Parameters<F>
  ) => EitherOutput<F, G>;
} => {
  const id = crypto.randomUUID();
  const catcher = catchErrorWithIdAndValue<T>(id);
  const thrower = (value: T) => {
    const e = makeErrorWithId(id);
    // @ts-expect-error This code has a distinct type of `Error`
    e.payload = value;
    throw e;
  };
  return { thrower, catcher };
};
