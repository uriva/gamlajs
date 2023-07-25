import { head, second } from "./array.ts";

import { filter } from "./filter.ts";
import { pipe } from "./composition.ts";

type Predicate<Args extends unknown[]> = (
  ..._: Args
) => boolean | Promise<boolean>;
type WithInput<Args extends unknown[]> = (..._: Args) => unknown;
export const ifElse = <Args extends unknown[]>(
  predicate: Predicate<Args>,
  fTrue: WithInput<Args>,
  fFalse: WithInput<Args>,
) =>
(...x: Args) => {
  const result = predicate(...x);
  return result instanceof Promise
    ? result.then((predicateResult) =>
      predicateResult ? fTrue(...x) : fFalse(...x)
    )
    : result
    ? fTrue(...x)
    : fFalse(...x);
};

export const unless = <T>(predicate: Predicate<[T]>, fFalse: WithInput<[T]>) =>
  ifElse(predicate, (x) => x, fFalse);

export const when = <T>(predicate: Predicate<[T]>, fTrue: WithInput<[T]>) =>
  ifElse(predicate, fTrue, (x) => x);

type CondElement<Args extends unknown[]> = [Predicate<Args>, WithInput<Args>];

export const cond = <Args extends unknown[]>(
  predicatesAndResolvers: CondElement<Args>[],
) =>
(...x: Args) =>
  pipe(
    // @ts-ignore reason: TODO - fix typing
    filter(pipe(head<CondElement<Args>>, (predicate: Predicate<Args>) =>
      predicate(...x))),
    head<CondElement<Args>[]>,
    second,
    (f: WithInput<Args>) =>
      f(...x),
  )(predicatesAndResolvers);
