const reduceHelper = <
  State,
  Element,
  Reducer extends
    | ((_1: State, _2: Element) => State)
    | ((_1: State, _2: Element) => Promise<State>),
>(
  reducer: Reducer,
  s: State,
  xs: Element[],
  firstIndex: number,
): ReturnType<Reducer> => {
  let current = s;
  for (let i = firstIndex; i < xs.length; i++) {
    if (current instanceof Promise)
      return current.then((s: State) =>
        reduceHelper(reducer, s, xs, i),
      ) as ReturnType<Reducer>;
    current = reducer(current, xs[i]) as State;
  }
  return current as ReturnType<Reducer>;
};

export const reduce =
  <
    State,
    Element,
    Reducer extends
      | ((_1: State, _2: Element) => State)
      | ((_1: State, _2: Element) => Promise<State>),
  >(
    reducer: Reducer,

    initial: () => State,
  ) =>
  (xs: Element[]) =>
    reduceHelper(reducer, initial(), xs, 0);

export const min =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) > key(x) ? x : s), xs[0], xs, 1);

export const max =
  <T>(key: (x: T) => number | Promise<number>) =>
  (xs: T[]) =>
    reduceHelper((s: T, x: T) => (key(s) < key(x) ? x : s), xs[0], xs, 1);
