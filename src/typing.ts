// deno-lint-ignore no-explicit-any
export type Union<T extends any[]> = T[number];

// deno-lint-ignore no-explicit-any
export type AsyncFunction = (...args: any[]) => Promise<any>;

export type IsAsync<T extends Func> = ReturnType<T> extends Promise<unknown>
  ? true
  : false;

export type AnyAsync<Functions> = Functions extends [infer F, ...infer Rest]
  // deno-lint-ignore no-explicit-any
  ? F extends (...args: any[]) => infer R // Extract return type
    // deno-lint-ignore no-explicit-any
    ? R extends Promise<any> // Check if it returns a Promise
      // deno-lint-ignore no-explicit-any
      ? any
    : AnyAsync<Rest>
  : AnyAsync<Rest>
  : never;

export type Unary<Input, Output> = (_: Input) => Output;

// deno-lint-ignore no-explicit-any
export type Func = (..._: any[]) => any;

export type ParamOf<T extends Func> = Parameters<T>[0];

type Length<L extends unknown[]> = L["length"];

export type Last<L extends unknown[]> = L[Length<Tail<L>>];

export type Tail<L extends unknown[]> = L extends
  readonly [unknown, ...infer LTail] ? LTail
  : L;

// deno-lint-ignore no-explicit-any
export type Second<T extends any[]> = T extends [any, infer S, ...unknown[]] ? S
  : never;

export type ElementOf<T> = T extends (infer X)[] ? X : never;

export type Reducer<T, S> = (state: S, element: T) => S;

export type ReturnTypeUnwrapped<F extends Func> = true extends IsAsync<F>
  ? Awaited<ReturnType<F>>
  : ReturnType<F>;

// deno-lint-ignore no-explicit-any
export type UnaryFnUntyped = (input: any) => any;

export type PromisifyFunction<F extends Func> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

export type EitherOutput<F extends Func, G extends Func> = F extends
  AsyncFunction ? Promise<ReturnTypeUnwrapped<F> | ReturnTypeUnwrapped<G>>
  : G extends AsyncFunction
    ? Promise<ReturnTypeUnwrapped<F> | ReturnTypeUnwrapped<G>>
  : (ReturnTypeUnwrapped<F> | ReturnTypeUnwrapped<G>);
