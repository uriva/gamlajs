import { AnyAsync, AsyncFunction, Func, Last } from "./typing.ts";
import { last, reverse } from "./array.ts";

import { not } from "./operator.ts";
import { reduce } from "./reduce.ts";

type UnaryFn<A, R> = (a: A) => R;
type Arg<F extends Func> = Parameters<F>[0];
// deno-lint-ignore no-explicit-any
type Res<F> = F extends UnaryFn<any, infer R> ? R : never;

// Return F1 if its return type is assignable to F2's argument type, otherwise
// return the required function type for the error message.
type ValidCompose<F1 extends Func, F2 extends Func> = Res<F1> extends
  (Arg<F2> | Promise<Arg<F2>>) ? F1
  : (...arg: Parameters<F1>) => Arg<F2>;

// For each function, validate the composition with its successor.
type ValidPipe<FS extends Func[]> = FS extends
  [infer F1 extends Func, infer F2 extends Func, ...infer Rest extends Func[]]
  ? [ValidCompose<F1, F2>, ...ValidPipe<[F2, ...Rest]>] // tuple length >= 2
  : FS; // tuple length < 2

type Pipeline<Functions extends Func[]> = Functions extends AnyAsync<Functions>
  ? (
    ...x: Parameters<Functions[0]>
  ) => Last<Functions> extends AsyncFunction ? ReturnType<Last<Functions>>
    : Promise<ReturnType<Last<Functions>>>
  : (
    ...x: Parameters<Functions[0]>
  ) => ReturnType<Last<Functions>>;

const pipeWithoutStack = <Fs extends Func[]>(
  ...fs: ValidPipe<Fs>
): Pipeline<Fs> =>
// @ts-expect-error TODO - fix typing
(...x) => reduce((v, f: Func) => f(v), () => fs[0](...x))(fs.slice(1));

interface StackFrame {
  file: string;
  line: number;
  column: number;
}

const frameToString = ({ line, file, column }: StackFrame) =>
  `${file}:${line}:${column}`;

const parseStackLine = (stackLine: string): null | StackFrame => {
  const matches = RegExp(/\s+at\s+(.+\s)?\(?(.+):(\d+):(\d+)\)?/).exec(
    stackLine,
  );
  if (!matches) return null;
  const [, , file, line, column] = matches;
  return { file, line: parseInt(line), column: parseInt(column) };
};

const parseStackTrace = (trace: string) =>
  parseStackLine(last(trace.split("\n")));

const errorBoundry = <F extends Func>(f: F) => {
  const err = new Error().stack as string;
  return ((...x) => {
    try {
      return f(...x);
    } catch (e) {
      const lastStackCall = parseStackTrace(err);
      if (lastStackCall) console.error(frameToString(lastStackCall));
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

export const sideEffect = <T>(f: (_: T) => void) => (x: T) => {
  f(x);
  return x;
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
