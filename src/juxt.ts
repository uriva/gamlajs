import { after, pipe } from "./composition.ts";
import { all, any, zip } from "./array.ts";

import { AnyAsync } from "./typing.ts";
import { map } from "./map.ts";
import { reduce } from "./reduce.ts";

type Func = (..._: any[]) => unknown;
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
    // @ts-ignore reason=ts does not understand me :_(
    return anyAsync ? Promise.all(result) : result;
  };

export const pairRight = <Input, Output>(f: (_: Input) => Output) =>
  juxt((x) => x, f);

export const stack = (...functions: ((x: any) => any)[]) =>
  pipe(
    (values: any[]) => zip(functions, values),
    map(([f, x]: [(x: any) => any, any]) => f(x)),
  );
export const juxtCat = pipe(
  juxt,
  after(
    reduce<any[], any[], false>(
      (a: any[], b: any[]) => a.concat(b),
      () => [],
    ),
  ),
);

export const alljuxt = pipe(juxt, after(all));
export const anyjuxt = pipe(juxt, after(any));
