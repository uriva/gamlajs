// Cannot be made point free.
export const promiseAll = (promises) => Promise.all(promises);

// Cannot be made point free.
export const wrapPromise = (x) => Promise.resolve(x);

export const isPromise = (x) =>
  !!(typeof x === "object" && x !== null && x.then);
