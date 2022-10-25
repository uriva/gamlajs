// Cannot be made point free.
export const promiseAll = (promises) => Promise.all(promises);

// Cannot be made point free.
export const wrapPromise = (x) => Promise.resolve(x);

export const isPromise = (x) =>
  !!(
    typeof x === "object" &&
    x !== null &&
    x.then &&
    typeof x.then === "function"
  );

export const doInSequence = (head, ...rest) =>
  wrapPromise(head()).then((x) => (rest.length ? doInSequence(...rest) : x));
