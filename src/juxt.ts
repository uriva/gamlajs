import { all, any, concat, zip } from "./array.ts";
import { identity, pipe } from "./composition.ts";
import { AnyAsync, Func, ReturnTypeUnwrapped, Union } from "./typing.ts";

import { map } from "./map.ts";

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

export const juxt =
  <Functions extends Func[]>(...fs: Functions) =>
  (...x: Parameters<Functions[0]>): JuxtOutput<Functions> => {
    const result = [];
    let anyAsync = false;
    for (const f of fs) {
      result.push(f(...x));
      anyAsync = anyAsync || result[result.length - 1] instanceof Promise;
    }
    // @ts-expect-error reason=ts does not understand me :_(
    return anyAsync ? Promise.all(result) : result;
  };

export const pairRight = <Function extends Func>(f: Function) =>
  juxt(identity<Parameters<Function>[0]>, f);

export const stack = <Functions extends Func[]>(
  ...functions: Functions
): (
  _: { [i in keyof Functions]: Parameters<Functions[i]>[0] },
) => JuxtOutput<Functions> =>
  // @ts-expect-error reason: too complex
  pipe((values) => zip(functions, values), map(([f, x]) => f(x)));

export const juxtCat = <Functions extends Func[]>(
  ...fs: Functions
): (..._: Parameters<Functions[0]>) => juxtCatOutput<Functions> =>
  // @ts-expect-error too complex
  pipe(juxt(...fs), concat);

export const alljuxt = <Functions extends Func[]>(
  ...fs: Functions
): (
  ..._: Parameters<Functions[0]>
) => Functions extends AnyAsync<Functions> ? Promise<boolean> : boolean =>
  // @ts-expect-error too complex
  pipe(juxt(...fs), all);

export const anyjuxt = <Functions extends Func[]>(
  ...fs: Functions
): (
  ..._: Parameters<Functions[0]>
) => Functions extends AnyAsync<Functions> ? Promise<boolean> : boolean =>
  // @ts-expect-error too complex
  pipe(juxt(...fs), any);
