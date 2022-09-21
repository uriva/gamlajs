import { isPromise } from "./promise";

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
