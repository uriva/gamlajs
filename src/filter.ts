import { head, second } from "./array.ts";
import { complement, pipe } from "./composition.ts";
import { pairRight } from "./juxt.ts";
import { map } from "./map.ts";
import { isPromise } from "./promise.ts";
import type { Func, IsAsync, ParamOf } from "./typing.ts";

type ConstrainedTyping<F extends Func> = F extends
  ((value: ParamOf<F>) => value is infer S) ? S[]
  : ParamOf<F>[];

/** Filter an array by predicate; supports async and type guards.
 * @example filter((x:number)=>x>1)([1,2,3]) // [2,3]
 */
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

/** Find first element matching predicate (async supported).
 * @example await find(async (x:number)=>x>1)([1,2,3]) // 2
 */
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
  // @ts-ignore ts cannot reason about this. error only in node not in deno.
  return asyncResults.length
    ? Promise.any(asyncResults).catch(() => undefined)
    // @ts-ignore ts cannot reason about this. error only in deno not in node.
    : undefined;
};

/** Remove elements matching predicate.
 * @example remove((x:number)=>x%2===0)([1,2,3]) // [1,3]
 */
export const remove = <F extends Func>(
  f: F,
): true extends IsAsync<F> ? (x: ParamOf<F>[]) => Promise<ParamOf<F>[]>
  : (x: ParamOf<F>[]) => ParamOf<F>[] =>
  // @ts-expect-error compiler cannot infer
  filter(complement(f));

type Primitive = string | number | boolean | null | undefined;

const toContainmentCheck = <T>(xs: T[]): (k: T) => boolean => {
  const set = new Set(xs);
  return (k: T): boolean => set.has(k);
};

/** Intersect arrays by a key function.
 * @example intersectBy((x:{id:number})=>x.id)([[{id:1}],[{id:1},{id:2}]]) // [{id:1}]
 */
export const intersectBy =
  <T>(f: (x: T) => Primitive) => (arrays: T[][]): T[] =>
    arrays.reduce((current, next) =>
      current.filter(pipe(f, toContainmentCheck(next.map(f))))
    );

/** Remove null values from an array and narrow the type.
 * @example removeNulls([1,null,2]) // [1,2]
 */
export const removeNulls = <T>(x: (T | null)[]): Exclude<T, null>[] =>
  x.filter(<T>(x: T | null): x is Exclude<T, null> => x !== null);
