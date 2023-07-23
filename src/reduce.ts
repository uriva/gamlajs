const reduceHelper = <T, S>(
  reducer: (s: Awaited<S>, x: T) => S,
  s: Awaited<S>,
  xs: T[],
  firstIndex: number,
): S => {
  let current = s;
  for (let i = firstIndex; i < xs.length; i++) {
    if (current instanceof Promise)
      return current.then((s: Awaited<S>) =>
        reduceHelper(reducer, s, xs, i),
      ) as S;
    current = reducer(current, xs[i]) as Awaited<S>;
  }
  return current;
};

export const reduce =
  <T, A>(reducer: (s: A, x: T) => A, initial: () => A) =>
  (xs: T[]) =>
    reduceHelper(reducer, initial() as Awaited<A>, xs, 0);

export const min =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) > key(x) ? x : s), xs[0], xs, 1);

export const max =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) < key(x) ? x : s), xs[0], xs, 1);
