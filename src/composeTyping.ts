import { Func } from "./typing.ts";

type Identity<T> = (x: T) => T;

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UnwrapPromiseFn<T extends Func> = (
  ...args: Parameters<T>
) => UnwrapPromise<ReturnType<T>>;

type SimpleCompose<F, G> = G extends (...args: infer GArgs) => infer GReturn
  ? F extends (x: UnwrapPromise<GReturn>) => infer FReturn
    ? (...args: GArgs) => UnwrapPromise<FReturn>
  : never
  : never;

type Compose<F, G> = F extends Identity<infer _>
  ? G extends Identity<infer _> ? UnwrapPromiseFn<G> : SimpleCompose<F, G>
  : SimpleCompose<F, G>;

export type ComposeMany<Fs extends Func[]> = Fs extends [] ? never
  : Fs extends [infer F extends Func] ? F
  : Fs extends
    [infer F extends Func, infer G extends Func, ...infer rest extends Func[]]
    ? rest extends [] ? Compose<G, F>
    : Compose<ComposeMany<rest>, Compose<G, F>>
  : never;
