import { allmap, anymap, concat, zip } from "./array.ts";
import { identity, pipe } from "./composition.ts";
import { isPromise } from "./promise.ts";
import { map } from "./map.ts";
import type {
  AnyAsync,
  Func,
  ParamOf,
  ReturnTypeUnwrapped,
  CompatibleInputs,
  Union,
} from "./typing.ts";

type Results<Functions extends Func[]> = {
  [i in keyof Functions]: ReturnTypeUnwrapped<Functions[i]>;
};

type JuxtOutput<Functions extends Func[]> = Functions extends
  AnyAsync<Functions> ? Promise<Results<Functions>> : Results<Functions>;

// deno-lint-ignore no-explicit-any
type ArrayOfOneOf<T extends any[]> = Union<Union<T>>[];

type AwaitedResults<Fs extends Func[]> = Fs extends
  [infer First extends Func, ...infer Rest extends Func[]]
  ? [ReturnTypeUnwrapped<First>, ...AwaitedResults<Rest>]
  : [];

type juxtCatOutput<Functions extends Func[]> = Functions extends
  AnyAsync<Functions> ? Promise<ArrayOfOneOf<AwaitedResults<Functions>>>
  : ArrayOfOneOf<Results<Functions>>;

/** Apply multiple functions to the same input(s) and collect results. */
export const juxt =
  <Fs extends Func[], Args extends unknown[] = Parameters<Fs[0]>>(
    ...fs: CompatibleInputs<Fs, Args>
  ) =>
  (...x: Args): JuxtOutput<Fs> => {
    const result = [];
    let anyAsync = false;
    for (const f of fs) {
      result.push(f(...x));
      anyAsync = anyAsync || isPromise(result[result.length - 1]);
    }
    // @ts-expect-error reason=ts does not understand me :_(
    return anyAsync ? Promise.all(result) : result;
  };

type PairOut<A, R> = R extends Promise<infer PR> ? Promise<[A, PR]> : [A, R];

/** Pair input with f(input) on the right. */
export const pairRight = <A, R>(f: (a: A) => R) => (a: A): PairOut<A, R> =>
  juxt(identity<A>, f)(a) as unknown as PairOut<A, R>;

/** Pair f(input) with input on the right. */
export const pairLeft = <A, R>(f: (a: A) => R) => (a: A): PairOut<A, R> =>
  juxt(f, identity<A>)(a) as unknown as PairOut<A, R>;

/** Map an array of inputs by a parallel array of functions. */
export const stack = <Functions extends Func[]>(
  ...functions: Functions
): (
  _: { [i in keyof Functions]: ParamOf<Functions[i]> },
) => JuxtOutput<Functions> =>
  // @ts-expect-error reason: too complex
  pipe((values) => zip([functions, values]), map(([f, x]) => f(x)));

/** Apply multiple functions and then concat their results. */
export const juxtCat = <
  Fs extends Func[],
  Args extends unknown[] = Parameters<Fs[0]>,
>(...fs: CompatibleInputs<Fs, Args>): (..._: Args) => juxtCatOutput<Fs> =>
  // @ts-expect-error too complex
  pipe(juxt(...fs), concat);

/** True if all functions return truthy for the same args. */
export const alljuxt = <Fs extends Func[]>(
  ...fs: Fs
) =>
(
  ...xs: Parameters<Fs[0]>
): Fs extends AnyAsync<Fs> ? Promise<boolean> : boolean =>
  // @ts-expect-error cannot infer
  allmap((f) => f(...xs))(fs);

/** True if any function returns truthy for the same args. */
export const anyjuxt = <Fs extends Func[]>(
  ...fs: Fs
) =>
(
  ...xs: Parameters<Fs[0]>
): Fs extends AnyAsync<Fs> ? Promise<boolean> : boolean =>
  // @ts-expect-error cannot infer
  anymap((f) => f(...xs))(fs);
