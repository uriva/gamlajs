import { not } from "./operator.js";
import { reduce } from "./reduce.js";
import { reverse } from "./array.js";
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

export const complement = (f) => pipe(f, not);

export const sideEffect = (f) => (x) => {
  f(x);
  return x;
};

export const applyTo =
  (...args) =>
  (f) =>
    f(...args);

export const always = (x) => () => x;

export const uncurry =
  (f) =>
  (param, ...rest) =>
    rest.length ? uncurry(f(param))(...rest) : f(param);
