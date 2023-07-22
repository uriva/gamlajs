const reduceHelper = <T, S>(
  reducer: (s: S, x: T) => S | Promise<S>,
  s: S,
  xs: T[],
  firstIndex: number,
): ReturnType<typeof reducer> => {
  let current: S | Promise<S> = s;
  for (let i = firstIndex; i < xs.length; i++) {
    if (current instanceof Promise)
      return current.then((s: S) => reduceHelper(reducer, s, xs, i));
    current = reducer(current, xs[i]);
  }
  return current;
};

export const reduce =
  <T, A>(reducer: (s: A, x: T) => A | Promise<A>, initial: () => A) =>
  (xs: T[]) =>
    reduceHelper(reducer, initial(), xs, 0);

export const min =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) > key(x) ? x : s), xs[0], xs, 1);

export const max =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) < key(x) ? x : s), xs[0], xs, 1);
