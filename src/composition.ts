import { reverse } from "./array.ts";
import type { ComposeMany } from "./composeTyping.ts";
import { not } from "./operator.ts";
import { isPromise } from "./promise.ts";
import { reduce } from "./reduce.ts";
import { currentLocation } from "./trace.ts";
import type {
  AnyAsync,
  Func,
  IsAsync,
  ParamOf,
  PromisifyFunction,
  UnaryFnUntyped,
} from "./typing.ts";

type UnaryFn<A, R> = (a: A) => R;

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

type Pipeline<Fs extends Func[]> = Fs extends AnyAsync<Fs>
  ? PromisifyFunction<ComposeMany<Fs>>
  : ComposeMany<Fs>;

/** Compose functions left-to-right; supports async seamlessly. */
const pipeWithoutStack = <Fs extends Func[]>(
  ...fs: ValidPipe<Fs>
): Pipeline<Fs> =>
  ((...x) =>
    reduce((v, f: Func) => f(v), () => fs[0](...x))(fs.slice(1))) as Pipeline<
      Fs
    >;

// deno-lint-ignore no-explicit-any
const augmentAndRethrowException = (location: string) => (e: any): never => {
  if (e === undefined) {
    console.error(`undefined error within ${location}`);
    throw e;
  }
  try {
    e.message = (e.message ? (e.message + "\n") : "") + location;
  } catch (augmentError) {
    console.error(
      `error within ${location}, gamla could not augment error stack`,
      augmentError,
      e,
    );
  }
  throw e;
};

/** Wrap a function to annotate thrown errors with call-site location. */
export const errorBoundry = <F extends Func>(f: F): F => {
  const location = currentLocation(4);
  return ((...x): ReturnType<F> => {
    try {
      const result = f(...x);
      return (isPromise(result)
        ? (result.catch(augmentAndRethrowException(location)) as ReturnType<F>)
        : result) as ReturnType<F>;
    } catch (e) {
      augmentAndRethrowException(location)(e);
    }
    // Unreachable, but helps TS understand control flow
    return undefined as never as ReturnType<F>;
  }) as F;
};

/** Pipe functions left-to-right; errors get augmented with stack info. */
export const pipe: typeof pipeWithoutStack = (...fs) =>
  // @ts-ignore error in deno but not in node
  errorBoundry(pipeWithoutStack(...fs));

type Reversed<Tuple> = Tuple extends [infer Head, ...infer Rest]
  ? [...Reversed<Rest>, Head]
  : [];

/** Compose functions right-to-left (alias of reversed pipe). */
export const compose = <Fs extends Func[]>(
  ...fs: Fs
): Fs extends ValidPipe<Reversed<Fs>> ? Pipeline<Reversed<Fs>> : never =>
  pipe(...reverse(fs));

/** Create a function that runs g then f(g(...)). */
export const after = <T>(f: UnaryFn<T, unknown>) =>
<L extends unknown[]>(
  g: (...args: L) => T,
): (...args: L) => unknown => (pipe(g, f) as unknown as (
  ...args: unknown[]
) => unknown);

/** Create a function that runs f1 then f2 on the result. */
export const before = <T>(f1: (...args: unknown[]) => T) =>
(
  f2: (input: T) => unknown,
): (...args: unknown[]) => unknown => (pipe(f1, f2) as unknown as (
  ...args: unknown[]
) => unknown);

/** Logical NOT of a predicate function. */
export const complement = <F extends Func>(
  f: F,
): (...x: Parameters<F>) => boolean =>
  // @ts-expect-error compiler cannot dynamically infer
  pipe(f, not);

/** Run a side-effect, return the original input (works with async). */
export const sideEffect =
  <F extends UnaryFnUntyped>(f: F) =>
  (x: ParamOf<F>): true extends IsAsync<F> ? Promise<ParamOf<F>>
    : ParamOf<F> => {
    const result = f(x);
    return (isPromise(result)) ? result.then(() => x) : x;
  };

/** Ensure cleanup runs after f resolves or returns. */
export const wrapSideEffect = <Args extends unknown[], Result>(
  cleanup: (...args: Args) => void | Promise<void>,
) =>
(f: (...args: Args) => Result) =>
(...args: Args): Result | Promise<Awaited<Result>> => {
  const result = f(...args);
  if (isPromise(result)) {
    return result.then((r) => {
      const result = r as Awaited<Result>;
      const cleanUpResult = cleanup(...args);
      return isPromise(cleanUpResult)
        ? cleanUpResult.then(() => result)
        : result;
    });
  } else {
    const cleanUpResult = cleanup(...args);
    return isPromise(cleanUpResult)
      ? (cleanUpResult.then(() => result) as Promise<Awaited<Result>>)
      : result;
  }
};

/** Apply args to a function (useful in specs). */
export const applyTo =
  <A extends unknown[]>(...args: A) => <R>(f: (...args: A) => R): R =>
    f(...args);

/** Constant function returning x. */
export const always = <T>(x: T): () => T => () => x;
/** Return input as-is. */
export const identity = <T>(x: T): T => x;

/** Lazily resolve a function before first call. */
export const thunk = <F extends Func>(f: () => F) => ((...x) => f()(...x)) as F;
