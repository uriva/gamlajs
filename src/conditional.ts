import { head, second } from "./array.ts";

import { filter } from "./filter.ts";
import { pipe } from "./composition.ts";

type Predicate<Args extends any[]> = (..._: Args) => boolean | Promise<boolean>;
type WithInput<Args extends any[]> = (..._: Args) => any;
export const ifElse =
  <Args extends any[]>(
    predicate: Predicate<Args>,
    fTrue: WithInput<Args>,
    fFalse: WithInput<Args>,
  ) =>
  (...x: Args) => {
    const result = predicate(...x);
    return result instanceof Promise
      ? result.then((predicateResult) =>
          predicateResult ? fTrue(...x) : fFalse(...x),
        )
      : result
      ? fTrue(...x)
      : fFalse(...x);
  };

export const unless = <T>(predicate: Predicate<[T]>, fFalse: WithInput<[T]>) =>
  ifElse(predicate, (x) => x, fFalse);

export const when = <T>(predicate: Predicate<[T]>, fTrue: WithInput<[T]>) =>
  ifElse(predicate, fTrue, (x) => x);

export const cond =
  <Args extends any[]>(
    predicatesAndResolvers: [Predicate<Args>, WithInput<Args>][],
  ) =>
  (...x: Args) =>
    pipe(
      filter(pipe(head, (predicate: Predicate<Args>) => predicate(...x))),
      head,
      second,
      (f: WithInput<Args>) => f(...x),
    )(predicatesAndResolvers);
