// deno-lint-ignore no-explicit-any
export type Union<T extends any[]> = T[number];

// deno-lint-ignore no-explicit-any
export type AsyncFunction = (...args: any[]) => Promise<any>;

export type AnyAsync<Functions> = Functions extends [infer f, ...infer rest]
  // deno-lint-ignore no-explicit-any
  ? f extends AsyncFunction ? any : AnyAsync<rest>
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

// deno-lint-ignore no-explicit-any
export type UnaryFnUntyped = (input: any) => any;
