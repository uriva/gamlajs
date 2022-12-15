import { head, second } from "./array.js";

import { filter } from "./filter.js";
import { isPromise } from "./promise.js";
import { pipe } from "./composition.js";

export const ifElse =
  (predicate, fTrue, fFalse) =>
  (...x) => {
    const result = predicate(...x);
    return isPromise(result)
      ? result.then((predicateResult) =>
          predicateResult ? fTrue(...x) : fFalse(...x),
        )
      : result
      ? fTrue(...x)
      : fFalse(...x);
  };

export const unless = (predicate, fFalse) =>
  ifElse(predicate, (x) => x, fFalse);

export const when = (predicate, fTrue) => ifElse(predicate, fTrue, (x) => x);

export const cond =
  (predicatesAndResolvers) =>
  (...x) =>
    pipe(
      filter(pipe(head, (predicate) => predicate(...x))),
      head,
      second,
      (f) => f(...x),
    )(predicatesAndResolvers);
