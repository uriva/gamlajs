import { Func, IsAsync } from "./typing.ts";

type Identity = <K>(x: K) => K;

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UnwrapPromiseFn<T extends Func> = true extends IsAsync<T> ? (
    ...args: Parameters<T>
  ) => UnwrapPromise<ReturnType<T>>
  : T;

type GenericGeneric<S> = <T extends S>(x: T) => T;

// deno-lint-ignore no-explicit-any
type IsGeneric<F extends Func, T = any> = F extends GenericGeneric<T> ? true
  : false;

type SimpleCompose<F, G> = G extends (...args: infer GArgs) => infer GReturn
  ? F extends (x: UnwrapPromise<GReturn>) => infer FReturn
    ? [true, true] extends [IsGeneric<G>, IsGeneric<F>] ? G
    : (...args: GArgs) => UnwrapPromise<FReturn> // todo: does not preserve generics in case of generic identity.
  : never
  : never;

type Compose<F extends Func, G extends Func> = F extends Identity
  ? UnwrapPromiseFn<G>
  : G extends Identity ? UnwrapPromiseFn<F>
  : SimpleCompose<F, G>;

export type ComposeMany<Fs extends Func[]> = Fs extends [] ? never
  : Fs extends [infer F extends Func] ? F
  : Fs extends
    [infer F extends Func, infer G extends Func, ...infer rest extends Func[]]
    ? rest extends [] ? Compose<G, F>
    : Compose<ComposeMany<rest>, Compose<G, F>>
  : never;
