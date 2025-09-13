/**
 * Wait for all promises to resolve.
 * @example
 * await promiseAll([Promise.resolve(1), Promise.resolve(2)]) // [1,2]
 */
export const promiseAll = (promises: Promise<unknown>[]): Promise<unknown[]> =>
  Promise.all(promises);

/** Wrap a value in a resolved Promise. */
export const wrapPromise = <T>(x: T): Promise<T> => Promise.resolve(x);

/** Type guard for Promise-like values. */
export const isPromise = (x: unknown): x is Promise<unknown> => {
  if (x == null) return false;
  const obj = x as { then?: unknown; catch?: unknown; finally?: unknown };
  return typeof obj.then === "function" && typeof obj.catch === "function" &&
    typeof obj.finally === "function";
};

type NullaryFunction = () => void | Promise<void>;

/**
 * Execute nullary functions one after another, waiting between each.
 * @example
 * await doInSequence(() => console.log('a'), () => console.log('b'))
 */
export const doInSequence = (
  head: NullaryFunction,
  ...rest: NullaryFunction[]
): Promise<void> =>
  wrapPromise(head()).then((x) =>
    rest.length ? doInSequence(rest[0], ...rest.slice(1)) : x
  );
