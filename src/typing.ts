// deno-lint-ignore no-explicit-any
export type AsyncFunction = (..._: any[]) => Promise<any>;

export type AnyAsync<Functions> = Functions extends [] ? never
  // deno-lint-ignore no-explicit-any
  : Functions extends [infer _1 extends AsyncFunction, ...infer _2] ? any
  : Functions extends [infer _, ...infer rest] ? AnyAsync<rest>
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

export type ReturnTypeUnwrapped<F extends Func> = F extends AsyncFunction
  ? Awaited<ReturnType<F>>
  : ReturnType<F>;
