import { AnyAsync, Func, ParamOf, ReturnTypeUnwrapped } from "./typing.ts";
import { head, second } from "./array.ts";

import { filter } from "./filter.ts";
import { pipe } from "./composition.ts";

export const ifElse = <F extends Func, If extends Func, Else extends Func>(
  predicate: F,
  fTrue: If,
  fFalse: Else,
) =>
(
  ...x: Parameters<F>
): [F, If, Else] extends AnyAsync<[F, If, Else]>
  ? Promise<Awaited<ReturnType<If>> | Awaited<ReturnType<Else>>>
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

type WhenUnless<Functions extends Func[]> = (
  ..._: Parameters<Functions[0]>
) => Functions extends AnyAsync<Functions>
  ? Promise<ParamOf<Functions[0]> | ReturnTypeUnwrapped<Functions[1]>>
  : ParamOf<Functions[0]> | ReturnType<Functions[1]>;

export const unless = <F extends Func, G extends Func>(
  predicate: F,
  fFalse: G,
): WhenUnless<[F, G]> =>
  ifElse(
    predicate,
    // @ts-expect-error cannot infer
    (...x) => x[0],
    fFalse,
  );

export const when = <F extends Func, G extends Func>(
  predicate: F,
  fTrue: G,
): WhenUnless<[F, G]> =>
  ifElse(
    predicate,
    fTrue,
    // @ts-expect-error cannot infer
    (...x) => x[0],
  );

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
