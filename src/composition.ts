import { not, spread } from "./operator.ts";

import { reduce } from "./reduce.ts";
import { reverse } from "./array.ts";

type UnaryFn<A, R> = (a: A) => R;
type Arg<F> = F extends UnaryFn<infer A, unknown> ? A : never;
type Res<F> = F extends UnaryFn<any, infer R> ? R : never;

// Return F1 if its return type is assignable to F2's argument type, otherwise
// return the required function type for the error message.
type ValidCompose<F1, F2> = Res<F1> extends Arg<F2> | Promise<Arg<F2>>
  ? F1
  : (arg: Arg<F1>) => Arg<F2>;

// For each function, validate the composition with its successor.
type ValidPipe<FS> = FS extends [infer F1, infer F2, ...infer Rest]
  ? [ValidCompose<F1, F2>, ...ValidPipe<[F2, ...Rest]>] // tuple length >= 2
  : FS; // tuple length < 2

export const pipe =
  <Fs extends Function[], A extends any[]>(...fs: ValidPipe<Fs>) =>
  (...x: A) =>
    reduce(
      (v, f) => (f as Function)(v),
      () => (fs[0] as Function)(...x),
    )(fs);

export const compose = pipe(reverse, spread(pipe));

export const after =
  <T>(f: UnaryFn<T, any>) =>
  <L extends any[]>(g: (...args: L) => T) =>
    pipe(g, f);

export const before =
  <T>(f1: (...args: any[]) => T) =>
  (f2: (input: T) => unknown) =>
    pipe(f1, f2);

export const complement = after<boolean>(not);

export const sideEffect =
  <T>(f: (x: T) => void) =>
  (x: T) => {
    f(x);
    return x;
  };

export const wrapSideEffect =
  <Args extends unknown[], Result>(
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
  <A extends unknown[]>(...args: A) =>
  (f: (...args: A) => unknown) =>
    f(...args);

export const always =
  <T>(x: T) =>
  () =>
    x;
export const identity = (x: any) => x;
