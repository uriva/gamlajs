import { isPromise } from "./promise.ts";

const reduceHelper = (reducer) => (s, xs, firstIndex) => {
  for (let i = firstIndex; i < xs.length; i++) {
    if (isPromise(s)) return s.then((s) => reduceHelper(reducer)(s, xs, i));
    s = reducer(s, xs[i]);
  }
  return s;
};

export const reduce = (reducer, initial) => (xs) =>
  initial
    ? reduceHelper(reducer)(initial(), xs, 0)
    : reduceHelper(reducer)(xs[0], xs, 1);

export const min = (key) => reduce((s, x) => (key(s) > key(x) ? x : s));
export const max = (key) => reduce((s, x) => (key(s) < key(x) ? x : s));
