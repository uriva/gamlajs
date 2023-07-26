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
