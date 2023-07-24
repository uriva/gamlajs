export type AsyncFunction = (..._: unknown[]) => Promise<unknown>;

export type AnyAsync<Functions> = Functions extends [] ? never
  : Functions extends [infer _1 extends AsyncFunction, ...infer _2] ? Functions
  : Functions extends [infer _, ...infer rest] ? AnyAsync<rest>
  : never;

export type Unary<Input, Output> = (_: Input) => Output;
