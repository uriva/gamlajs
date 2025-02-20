import { allmap, anymap, concat, zip } from "./array.ts";
import { identity, pipe } from "./composition.ts";
import { isPromise } from "./promise.ts";
import { map } from "./map.ts";
import type {
  AnyAsync,
  Func,
  ParamOf,
  ReturnTypeUnwrapped,
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

export const juxt = <Fs extends Func[]>(...fs: Fs) =>
(
  ...x: Parameters<Fs[0]>
): JuxtOutput<Fs> => {
  const result = [];
  let anyAsync = false;
  for (const f of fs) {
    result.push(f(...x));
    anyAsync = anyAsync || isPromise(result[result.length - 1]);
  }
  // @ts-expect-error reason=ts does not understand me :_(
  return anyAsync ? Promise.all(result) : result;
};

export const pairRight = <F extends Func>(f: F) =>
  juxt(identity<ParamOf<F>>, f);

export const pairLeft = <F extends Func>(f: F) => juxt(f, identity<ParamOf<F>>);

export const stack = <Functions extends Func[]>(
  ...functions: Functions
): (
  _: { [i in keyof Functions]: ParamOf<Functions[i]> },
) => JuxtOutput<Functions> =>
  // @ts-expect-error reason: too complex
  pipe((values) => zip([functions, values]), map(([f, x]) => f(x)));

export const juxtCat = <Fs extends Func[]>(
  ...fs: Fs
): (..._: Parameters<Fs[0]>) => juxtCatOutput<Fs> =>
  // @ts-expect-error too complex
  pipe(juxt(...fs), concat);

export const alljuxt = <Fs extends Func[]>(
  ...fs: Fs
) =>
(
  ...xs: Parameters<Fs[0]>
): Fs extends AnyAsync<Fs> ? Promise<boolean> : boolean =>
  // @ts-expect-error cannot infer
  allmap((f) => f(...xs))(fs);

export const anyjuxt = <Fs extends Func[]>(
  ...fs: Fs
) =>
(
  ...xs: Parameters<Fs[0]>
): Fs extends AnyAsync<Fs> ? Promise<boolean> : boolean =>
  // @ts-expect-error cannot infer
  anymap((f) => f(...xs))(fs);
