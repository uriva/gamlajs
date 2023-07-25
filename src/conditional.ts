import { head, second } from "./array.ts";

import { filter } from "./filter.ts";
import { pipe } from "./composition.ts";
import { AnyAsync, BooleanEquivalent } from "./typing.ts";

// deno-lint-ignore no-explicit-any
type Func<Input extends any[], Output> = (..._: Input) => Output;
type PredicateType =
  // deno-lint-ignore no-explicit-any
  | ((..._: any[]) => BooleanEquivalent)
  // deno-lint-ignore no-explicit-any
  | ((..._: any[]) => Promise<BooleanEquivalent>);

export const ifElse = <
  Predicate extends PredicateType,
  // deno-lint-ignore no-explicit-any
  If extends (..._: Parameters<Predicate>) => any,
  Else extends (..._: Parameters<Predicate>) => ReturnType<If>,
>(
  predicate: Predicate,
  fTrue: If,
  fFalse: Else,
) =>
(
  ...x: Parameters<Predicate>
): [Predicate, If, Else] extends AnyAsync<[Predicate, If, Else]>
  ? Promise<Awaited<ReturnType<If>>>
  : ReturnType<If> => {
  const result = predicate(...x);
  // @ts-ignore: too complex
  return result instanceof Promise
    ? result.then((predicateResult) =>
      predicateResult ? fTrue(...x) : fFalse(...x)
    )
    : result
    ? fTrue(...x)
    : fFalse(...x);
};

export const unless = <
  Predicate extends (
    // deno-lint-ignore no-explicit-any
    | ((_: any) => BooleanEquivalent)
    // deno-lint-ignore no-explicit-any
    | ((_: any) => Promise<BooleanEquivalent>)
  ),
>(
  predicate: Predicate,
  // deno-lint-ignore no-explicit-any
  fFalse: (_: Parameters<Predicate>[0]) => any,
) => ifElse(predicate, (...x) => x[0], fFalse);

export const when = <
  Predicate extends (
    // deno-lint-ignore no-explicit-any
    | ((_: any) => BooleanEquivalent)
    // deno-lint-ignore no-explicit-any
    | ((_: any) => Promise<BooleanEquivalent>)
  ),
> // deno-lint-ignore no-explicit-any
(predicate: Predicate, fTrue: (_: Parameters<Predicate>[0]) => any) =>
  ifElse(predicate, fTrue, (...x) => x[0]);

type CondElement<Args extends unknown[]> = [
  Predicate<Args>,
  Func<Args, Output>,
];

export const cond = <Args extends unknown[], Output>(
  predicatesAndResolvers: CondElement<Args>[],
) =>
(...x: Args) =>
  pipe(
    filter(pipe(head, (predicate) => predicate(...x))),
    head<CondElement<Args>[]>,
    second,
    (f: Func<Args, Output>) => f(...x),
  )(predicatesAndResolvers);
