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
      return current.then((s) =>
        reduceHelper(reducer, s as State, xs, i)
      ) as ReturnType<Reducer>;
    }
    current = reducer(current, xs[i]) as State;
  }
  return current as ReturnType<Reducer>;
};

/** Reduce an array with an initial state (sync or async reducer). */
// deno-lint-ignore no-explicit-any
export const reduce = <F extends (state: any, element: any) => any>(
  reducer: F,
  initial: () => ReturnTypeUnwrapped<F>,
) =>
(
  xs: Parameters<F>[1][],
): IsAsync<F> extends true ? Promise<ReturnTypeUnwrapped<F>>
  : ReturnTypeUnwrapped<F> =>
  reduceHelper(reducer, initial(), xs, 0) as IsAsync<F> extends true
    ? Promise<ReturnTypeUnwrapped<F>>
    : ReturnTypeUnwrapped<F>;

/**
 * Get the minimal element by key function (supports async key).
 * @example
 * min((x:number)=>x)([3,1,2]) // 1
 */
export const min =
  <F extends Func>(key: F) =>
  (xs: ParamOf<F>[]): IsAsync<F> extends true ? Promise<ParamOf<F>>
    : ParamOf<F> =>
    reduceHelper(
      (
        s: ParamOf<F>,
        x: ParamOf<F>,
      ): IsAsync<F> extends true ? Promise<ParamOf<F>>
        : ParamOf<F> => {
        const keyS = key(s);
        const keyX = key(x);
        return ((isPromise(keyS) || isPromise(keyX))
          ? Promise.all([keyS, keyX]).then(([keyS, keyX]) =>
            keyS < keyX ? s : x
          )
          : key(s) < key(x)
          ? s
          : x) as IsAsync<F> extends true ? Promise<ParamOf<F>>
            : ParamOf<F>;
      },
      xs[0],
      xs,
      1,
    );

/**
 * Get the maximal element by key function (supports async key).
 * @example
 * max((x:number)=>x)([3,1,2]) // 3
 */
export const max =
  <F extends Func>(key: F) =>
  (xs: ParamOf<F>[]): IsAsync<F> extends true ? Promise<ParamOf<F>>
    : ParamOf<F> =>
    reduceHelper(
      (
        s: ParamOf<F>,
        x: ParamOf<F>,
      ): IsAsync<F> extends true ? Promise<ParamOf<F>>
        : ParamOf<F> => {
        const keyS = key(s);
        const keyX = key(x);
        return ((isPromise(keyS) || isPromise(keyX))
          ? Promise.all([keyS, keyX]).then(([keyS, keyX]) =>
            keyS < keyX ? x : s
          )
          : key(s) < key(x)
          ? x
          : s) as IsAsync<F> extends true ? Promise<ParamOf<F>>
            : ParamOf<F>;
      },
      xs[0],
      xs,
      1,
    );
