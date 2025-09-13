import { isPromise } from "./promise.ts";
import type { Func, IsAsync, ParamOf, ReturnTypeUnwrapped } from "./typing.ts";

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
    if (isPromise(current)) {
      return current.then((s: State) =>
        reduceHelper(reducer, s, xs, i)
      ) as ReturnType<Reducer>;
    }
    current = reducer(current, xs[i]) as State;
  }
  return current as ReturnType<Reducer>;
};

// deno-lint-ignore no-explicit-any
export const reduce = <Function extends (state: any, element: any) => any>(
  reducer: Function,
  initial: () => ReturnTypeUnwrapped<Function>,
) =>
(xs: Parameters<Function>[1][]): ReturnTypeUnwrapped<Function> =>
  reduceHelper(reducer, initial(), xs, 0) as ReturnTypeUnwrapped<Function>;

export const min =
  <F extends Func>(key: F) =>
  (xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<ParamOf<F>>
    : ParamOf<F> =>
    reduceHelper(
      (
        s: ParamOf<F>,
        x: ParamOf<F>,
      ): true extends IsAsync<F> ? Promise<ParamOf<F>>
        : ParamOf<F> => {
        const keyS = key(s);
        const keyX = key(x);
        return ((isPromise(keyS) || isPromise(keyX))
          ? Promise.all([keyS, keyX]).then(([keyS, keyX]) =>
            keyS < keyX ? s : x
          )
          : key(s) < key(x)
          ? s
          : x) as true extends IsAsync<F> ? Promise<ParamOf<F>>
            : ParamOf<F>;
      },
      xs[0],
      xs,
      1,
    );

export const max =
  <F extends Func>(key: F) =>
  (xs: ParamOf<F>[]): true extends IsAsync<F> ? Promise<ParamOf<F>>
    : ParamOf<F> =>
    reduceHelper(
      (
        s: ParamOf<F>,
        x: ParamOf<F>,
      ): true extends IsAsync<F> ? Promise<ParamOf<F>>
        : ParamOf<F> => {
        const keyS = key(s);
        const keyX = key(x);
        return ((isPromise(keyS) || isPromise(keyX))
          ? Promise.all([keyS, keyX]).then(([keyS, keyX]) =>
            keyS < keyX ? x : s
          )
          : key(s) < key(x)
          ? x
          : s) as true extends IsAsync<F> ? Promise<ParamOf<F>>
            : ParamOf<F>;
      },
      xs[0],
      xs,
      1,
    );
