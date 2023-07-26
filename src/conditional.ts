import { AnyAsync, BooleanEquivalent } from "./typing.ts";
import { head, second } from "./array.ts";

import { filter } from "./filter.ts";
import { pipe } from "./composition.ts";

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
  // deno-lint-ignore no-explicit-any
  Else extends (..._: Parameters<Predicate>) => any,
>(
  predicate: Predicate,
  fTrue: If,
  fFalse: Else,
) =>
(
  ...x: Parameters<Predicate>
): [Predicate, If, Else] extends AnyAsync<[Predicate, If, Else]>
  ? Promise<Awaited<ReturnType<If>> | Awaited<ReturnType<Else>>>
  : ReturnType<If> | ReturnType<Else> => {
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
  (..._: Args) => boolean | Promise<boolean>,
  // deno-lint-ignore no-explicit-any
  (..._: Args) => any,
];

// deno-lint-ignore no-explicit-any
export const cond = <CondElements extends CondElement<any[]>[]>(
  predicatesAndResolvers: CondElements,
) =>
(
  ...x: Parameters<CondElements[0][0]>
) =>
  pipe(
    filter(pipe(head, (predicate) => predicate(...x))),
    // @ts-ignore too complex
    head,
    second,
    (f) => f(...x),
  )(predicatesAndResolvers);
