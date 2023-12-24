import { reverse } from "./array.ts";
import {
  AnyAsync,
  AsyncFunction,
  Func,
  Last,
  ParamOf,
  ReturnTypeUnwrapped,
} from "./typing.ts";

import { not } from "./operator.ts";
import { reduce } from "./reduce.ts";
import { currentLocation } from "./trace.ts";

type UnaryFn<A, R> = (a: A) => R;
// deno-lint-ignore no-explicit-any
type UnaryFnUntyped = (a: any) => any;
// deno-lint-ignore no-explicit-any
type Res<F> = F extends UnaryFn<any, infer R> ? R : never;

// Return F1 if its return type is assignable to F2's argument type, otherwise
// return the required function type for the error message.
type ValidCompose<F1 extends Func, F2 extends Func> = Res<F1> extends
  (ParamOf<F2> | Promise<ParamOf<F2>>) ? F1
  : (...arg: Parameters<F1>) => ParamOf<F2>;

// For each function, validate the composition with its successor.
type ValidPipe<FS extends Func[]> = FS extends
  [infer F1 extends Func, infer F2 extends Func, ...infer Rest extends Func[]]
  ? [ValidCompose<F1, F2>, ...ValidPipe<[F2, ...Rest]>] // tuple length >= 2
  : FS; // tuple length < 2

type Pipeline<Fs extends Func[]> = (
  ...x: Parameters<Fs[0]>
) => Fs extends AnyAsync<Fs> ? Promise<ReturnTypeUnwrapped<Last<Fs>>>
  : ReturnType<Last<Fs>>;

const pipeWithoutStack = <Fs extends Func[]>(
  ...fs: ValidPipe<Fs>
): Pipeline<Fs> =>
  ((...x) =>
    reduce((v, f: Func) => f(v), () => fs[0](...x))(fs.slice(1))) as Pipeline<
      Fs
    >;

const errorBoundry = <F extends Func>(f: F) => {
  const codeLocation = currentLocation(4);
  return ((...x) => {
    try {
      const result = f(...x);
      if (result instanceof Promise) {
        return result.catch((e) => {
          console.error(codeLocation);
          throw e;
        });
      }
      return result;
    } catch (e) {
      console.error(codeLocation);
      throw e;
    }
  }) as F;
};

export const pipe: typeof pipeWithoutStack = (...fs) =>
  errorBoundry(pipeWithoutStack(...fs));

type Reversed<Tuple> = Tuple extends [infer Head, ...infer Rest]
  ? [...Reversed<Rest>, Head]
  : [];

export const compose = <Fs extends Func[]>(
  ...fs: Fs
): Fs extends ValidPipe<Reversed<Fs>> ? Pipeline<Reversed<Fs>> : never =>
  // @ts-expect-error reason: TODO - fix typing
  pipe(...reverse(fs));

export const after =
  <T>(f: UnaryFn<T, unknown>) => <L extends unknown[]>(g: (...args: L) => T) =>
    pipe(g, f);

export const before =
  <T>(f1: (...args: unknown[]) => T) => (f2: (input: T) => unknown) =>
    pipe(f1, f2);

export const complement = <F extends Func>(
  f: F,
): (...x: Parameters<F>) => boolean =>
  // @ts-expect-error compiler cannot dynamically infer
  pipe(f, not);

export const sideEffect =
  <F extends UnaryFnUntyped>(f: F) =>
  (x: ParamOf<F>): F extends AsyncFunction ? Promise<ParamOf<F>>
    : ParamOf<F> => {
    const result = f(x);
    // @ts-expect-error compiler cannot dynamically infer
    return (result instanceof Promise) ? result.then(() => x) : x;
  };

export const wrapSideEffect = <Args extends unknown[], Result>(
  cleanup: (...args: Args) => void | Promise<void>,
) =>
(f: (...args: Args) => Result) =>
(...args: Args) => {
  const result = f(...args);
  if (result instanceof Promise) {
    return result.then((result: Awaited<Result>) => {
      const cleanUpResult = cleanup(...args);
      return cleanUpResult instanceof Promise
        ? cleanUpResult.then(() => result)
        : result;
    });
  } else {
    const cleanUpResult = cleanup(...args);
    return cleanUpResult instanceof Promise
      ? cleanUpResult.then(() => result)
      : result;
  }
};

export const applyTo =
  <A extends unknown[]>(...args: A) => (f: (...args: A) => unknown) =>
    f(...args);

export const always = <T>(x: T) => () => x;
export const identity = <T>(x: T) => x;

export const thunk = <F extends Func>(f: () => F) => ((...x) => f()(...x)) as F;
