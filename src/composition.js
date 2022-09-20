import { empty, reverse, tail } from "./array";

import { isPromise } from "./promise";

const pipeStep =
  (fs) =>
  (...x) =>
    pipe(...tail(fs))(fs[0](...x));

export const pipe =
  (...fs) =>
  (...x) =>
    empty(fs)
      ? x[0]
      : x.length === 1 && isPromise(x[0])
      ? x[0].then(pipeStep(fs))
      : pipeStep(fs)(...x);

export const compose = (...fs) => pipe(...reverse(fs));

export const after = (f1) => (f2) => pipe(f2, f1);
export const before = (f1) => (f2) => pipe(f1, f2);
