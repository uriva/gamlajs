// Cannot be made point free.
export const promiseAll = (promises: Promise<unknown>[]) =>
  Promise.all(promises);

// Cannot be made point free.
export const wrapPromise = <T>(x: T): Promise<T> => Promise.resolve(x);

export const isPromise = (x: any) =>
  !!(
    typeof x === "object" &&
    x !== null &&
    x.then &&
    typeof x.then === "function"
  );
type NullaryFunction = () => void | Promise<void>;

export const doInSequence = (
  head: NullaryFunction,
  ...rest: NullaryFunction[]
): Promise<void> =>
  wrapPromise(head()).then((x) =>
    rest.length ? doInSequence(rest[0], ...rest.slice(1)) : x,
  );
