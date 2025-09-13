import { enumerate, head, second } from "./array.ts";
import type { AnyAsync, Func, ParamOf, ReturnTypeUnwrapped } from "./typing.ts";

import { pipe } from "./composition.ts";
import { filter } from "./filter.ts";
import { isPromise } from "./promise.ts";

/** Branch execution by predicate; supports async transparently. */
export const ifElse =
  <Predicate extends Func, If extends Func, Else extends Func>(
    predicate: Predicate,
    fTrue: If,
    fFalse: Else,
  ) =>
  (
    ...x: Parameters<Predicate>
  ): [Predicate, If, Else] extends AnyAsync<[Predicate, If, Else]>
    ? Promise<ReturnTypeUnwrapped<If> | ReturnTypeUnwrapped<Else>>
    : ReturnType<If> | ReturnType<Else> => {
    const result = predicate(...x);
    return isPromise(result)
      // @ts-ignore ts cannot reason about this, error only in deno not in node.
      ? result.then((predicateResult) =>
        predicateResult ? fTrue(...x) : fFalse(...x)
      )
      : result
      ? fTrue(...x)
      : fFalse(...x);
  };

type WhenUnless<Predicate extends Func, Resolver extends Func> = (
  ...params: Parameters<Predicate>
) => true extends AnyAsync<[Predicate, Resolver]>
  ? Promise<ParamOf<Predicate> | ReturnTypeUnwrapped<Resolver>>
  : ParamOf<Predicate> | ReturnType<Resolver>;

/** Return input unless predicate is true, otherwise apply fFalse. */
export const unless = <F extends Func, G extends Func>(
  predicate: F,
  fFalse: G,
): WhenUnless<F, G> => ifElse(predicate, (...x: Parameters<F>) => x[0], fFalse);

/** Apply fTrue only when predicate holds, else return input. */
export const when = <F extends Func, G extends Func>(
  predicate: F,
  fTrue: G,
): WhenUnless<F, G> => ifElse(predicate, fTrue, (...x: Parameters<F>) => x[0]);

type ReturnTypeOfSecondOfElements<Fs extends [Func, Func][]> = {
  [K in keyof Fs]: ReturnType<Fs[K][1]>;
}[number];

/** Choose the first matching [predicate, resolver]. */
export const cond =
  <Fss extends [Func, Func][]>(predicatesAndResolvers: Fss) =>
  (...x: Parameters<Fss[0][0]>): ReturnTypeOfSecondOfElements<Fss> =>
    // @ts-expect-error cannot infer
    pipe(
      // Cast head for TS to accept the composition chain
      filter(pipe(head as unknown as (y: unknown) => unknown, (predicate) =>
        (predicate as Func)(...x))),
      head,
      second,
      (f) =>
        f(...x),
    )(predicatesAndResolvers);

/** Like cond but evaluates predicates lazily one by one. */
export const lazyCond =
  <Fss extends [Func, Func][]>(predicatesAndResolvers: Fss) =>
  (...args: Parameters<Fss[0][0]>): ReturnTypeOfSecondOfElements<Fss> => {
    for (
      const [i, [predicate, resolver]] of enumerate(predicatesAndResolvers)
    ) {
      const result = predicate(...args);
      if (isPromise(result)) {
        // deno-lint-ignore no-explicit-any
        return result.then((awaitedResult: any) => {
          if (awaitedResult) return resolver(...args);
          return lazyCond(predicatesAndResolvers.slice(i + 1))(...args);
        }) as ReturnTypeOfSecondOfElements<Fss>;
      }
      if (result) return resolver(...args);
    }
    throw new Error("Fallen through last condition");
  };
