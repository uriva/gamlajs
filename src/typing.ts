// deno-lint-ignore no-explicit-any
export type AsyncFunction = (..._: any[]) => Promise<any>;

export type AnyAsync<Functions> = Functions extends [] ? never
  : Functions extends [infer _1 extends AsyncFunction, ...infer _2] ? Functions
  : Functions extends [infer _, ...infer rest] ? AnyAsync<rest>
  : never;

export type Unary<Input, Output> = (_: Input) => Output;

export type BooleanEquivalent = boolean | string | number | null | undefined;

// deno-lint-ignore no-explicit-any
export type Func = (..._: any[]) => unknown;

export type ParamOf<T extends Func> = Parameters<T>[0];

export type Length<L extends unknown[]> = L["length"];

export type Last<L extends unknown[]> = L[Length<Tail<L>>];

export type Tail<L extends unknown[]> = L extends
  readonly [unknown, ...infer LTail] ? LTail
  : L;

// deno-lint-ignore no-explicit-any
export type Second<T extends any[]> = T extends [any, infer S, ...unknown[]] ? S
  : never;
