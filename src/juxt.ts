import { AnyAsync, Func } from "./typing.ts";
import { after, pipe } from "./composition.ts";
import { all, any, zip } from "./array.ts";

import { map } from "./map.ts";
import { reduce } from "./reduce.ts";

type AwaitedResults<Functions extends Func[]> = Promise<
  { [i in keyof Functions]: Awaited<ReturnType<Functions[i]>> }
>;
type Results<Functions extends Func[]> = {
  [i in keyof Functions]: ReturnType<Functions[i]>;
};

type JuxtOutput<Functions extends Func[]> = Functions extends
  AnyAsync<Functions> ? AwaitedResults<Functions>
  : Results<Functions>;

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

// deno-lint-ignore no-explicit-any
export const pairRight = <Function extends (_: any) => any>(f: Function) =>
  juxt((x) => x, f);

export const stack = <Functions extends Func[]>(
  ...functions: Functions
): (
  _: { [i in keyof Functions]: Parameters<Functions[i]>[0] },
) => JuxtOutput<Functions> =>
  // @ts-expect-error reason: too complex
  pipe((values) => zip(functions, values), map(([f, x]) => f(x)));

export const juxtCat = pipe(
  juxt,
  after(
    reduce(
      // deno-lint-ignore no-explicit-any
      (a: any[], b: any[]) => a.concat(b),
      () => [],
    ),
  ),
);

export const alljuxt = pipe(juxt, after(all));
export const anyjuxt = pipe(juxt, after(any));
