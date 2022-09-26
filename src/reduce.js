import { isPromise } from "./promise.js";

const reduceHelper = (reducer) => (s, xs, firstIndex) => {
  if (firstIndex === xs.length) return s;
  return isPromise(s)
    ? s.then((s) =>
        reduceHelper(reducer)(reducer(s, xs[firstIndex]), xs, firstIndex + 1),
      )
    : reduceHelper(reducer)(reducer(s, xs[firstIndex]), xs, firstIndex + 1);
};

export const reduce = (reducer, initial) => (xs) =>
  initial
    ? reduceHelper(reducer)(initial(), xs, 0)
    : reduceHelper(reducer)(xs[0], xs, 1);

export const min = (key) => reduce((s, x) => (key(s) > key(x) ? x : s));
export const max = (key) => reduce((s, x) => (key(s) < key(x) ? x : s));
