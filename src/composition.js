import { isPromise } from "./promise.ts";
import { not } from "./operator.ts";
import { reduce } from "./reduce.js";
import { reverse } from "./array.ts";

export const pipe =
  (...fs) =>
  (...x) =>
    reduce(
      (s, x) => x(s),
      () => fs[0](...x),
    )(fs.slice(1));
export const compose = (...fs) => pipe(...reverse(fs));

export const after = (f1) => (f2) => pipe(f2, f1);
export const before = (f1) => (f2) => pipe(f1, f2);

export const complement = after(not);

export const sideEffect = (f) => (x) => {
  f(x);
  return x;
};

export const wrapSideEffect =
  (cleanup) =>
  (f) =>
  (...args) => {
    const result = f(...args);
    if (isPromise(result)) {
      return result.then((result) => {
        const cleanUpResult = cleanup(...args);
        return isPromise(cleanUpResult)
          ? cleanUpResult.then(() => result)
          : result;
      });
    } else {
      const cleanUpResult = cleanup(...args);
      return isPromise(cleanUpResult)
        ? cleanUpResult.then(() => result)
        : result;
    }
  };

export const applyTo =
  (...args) =>
  (f) =>
    f(...args);

export const always = (x) => () => x;
export const identity = (x) => x;

export const uncurry =
  (f) =>
  (param, ...rest) =>
    rest.length ? uncurry(f(param))(...rest) : f(param);
