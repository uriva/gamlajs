import { head, second } from "./array.ts";
import { AnyAsync, Func, ParamOf, ReturnTypeUnwrapped } from "./typing.ts";

import { pipe } from "./composition.ts";
import { filter } from "./filter.ts";

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
    return result instanceof Promise
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

export const unless = <F extends Func, G extends Func>(
  predicate: F,
  fFalse: G,
): WhenUnless<F, G> => ifElse(predicate, (...x: Parameters<F>) => x[0], fFalse);

export const when = <F extends Func, G extends Func>(
  predicate: F,
  fTrue: G,
): WhenUnless<F, G> => ifElse(predicate, fTrue, (...x: Parameters<F>) => x[0]);

type ReturnTypeOfSecondOfElements<Fs extends [Func, Func][]> = {
  [K in keyof Fs]: ReturnType<Fs[K][1]>;
}[number];

export const cond =
  <Fss extends [Func, Func][]>(predicatesAndResolvers: Fss) =>
  (...x: Parameters<Fss[0][0]>): ReturnTypeOfSecondOfElements<Fss> =>
    // @ts-expect-error cannot infer
    pipe(
      filter(pipe(head, (predicate) => predicate(...x))),
      head,
      second,
      (f) => f(...x),
    )(predicatesAndResolvers);
