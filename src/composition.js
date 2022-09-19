import { empty, head, reverse, tail } from "./array";

const isPromise = (x) => !!(typeof x === "object" && x !== null && x.then);
const pipeStep = (fs) => (x) => pipe(...tail(fs))(head(fs)(x));
export const pipe =
  (...fs) =>
  (x) =>
    empty(fs) ? x : isPromise(x) ? x.then(pipeStep(fs)) : pipeStep(fs)(x);

export const compose = (...fs) => pipe(...reverse(fs));

export const after = (f1) => (f2) => pipe(f2, f1);
export const before = (f1) => (f2) => pipe(f1, f2);
