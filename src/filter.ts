import { head, second } from "./array.ts";
import { complement, pipe } from "./composition.ts";
import { pairRight } from "./juxt.ts";
import { map } from "./map.ts";
import { isPromise } from "./promise.ts";
import type { Func, IsAsync, ParamOf } from "./typing.ts";

type ConstrainedTyping<F extends Func> = F extends
  ((value: ParamOf<F>) => value is infer S) ? S[]
  : ParamOf<F>[];

export const filter = <F extends Func>(f: F): (
  _: ParamOf<F>[],
) => true extends IsAsync<F> ? Promise<ConstrainedTyping<F>>
  : ConstrainedTyping<F> =>
  // @ts-expect-error typing head is hard.
  pipe(
    map(pairRight(f)),
    (array) => array.filter(second),
    map(head),
  );

export const find = <F extends Func>(
  predicate: F,
) =>
(xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<ParamOf<F> | undefined>
  : ParamOf<F> | undefined => {
  const asyncResults: Promise<ParamOf<F>>[] = [];
  for (const x of xs) {
    const result = predicate(x);
    if (isPromise(result)) {
      asyncResults.push(
        result.then((predicateResult) =>
          new Promise((resolve, reject) =>
            predicateResult ? resolve(x) : reject(new Error("failed check"))
          )
        ),
      );
    } else if (result) return x;
  }
  return asyncResults.length
    ? Promise.any(asyncResults).catch(() => undefined)
    // @ts-expect-error ts cannot reason about this.
    : undefined;
};

export const remove = <F extends Func>(
  f: F,
): true extends IsAsync<F> ? (x: ParamOf<F>[]) => Promise<ParamOf<F>[]>
  : (x: ParamOf<F>[]) => ParamOf<F>[] =>
  // @ts-expect-error compiler cannot infer
  filter(complement(f));

type Primitive = string | number | boolean | null | undefined;

const toContainmentCheck = <T>(xs: T[]) => {
  const set = new Set(xs);
  return (k: T) => set.has(k);
};

export const intersectBy = <T>(f: (x: T) => Primitive) => (arrays: T[][]) =>
  arrays.reduce((current, next) =>
    current.filter(pipe(f, toContainmentCheck(next.map(f))))
  );

export const removeNulls = <T>(x: (T | null)[]) =>
  x.filter(<T>(x: T | null): x is Exclude<T, null> => x !== null);
