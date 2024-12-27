import type {
  AsyncFunction,
  ElementOf,
  Func,
  ParamOf,
  Reducer,
  ReturnTypeUnwrapped,
  Unary,
} from "./typing.ts";
import { applyTo, identity, pipe } from "./composition.ts";
import { head, second, wrapArray } from "./array.ts";

import { filter } from "./filter.ts";
import { map } from "./map.ts";
import { reduce } from "./reduce.ts";
import { stack } from "./juxt.ts";

export const wrapObject = <V>(key: string) => (value: V) => ({ [key]: value });

type Primitive = string | number | symbol;

export const groupByManyReduce = <T, S, K extends Primitive>(
  keys: (_: T) => K[],
  reducer: Reducer<T, S>,
  initial: () => S,
) =>
(it: T[]) => {
  const result = {} as Record<K, S>;
  for (const x of it) {
    for (const key of keys(x)) {
      result[key] = reducer(key in result ? result[key] : initial(), x);
    }
  }
  return result;
};

export const count = reduce(
  <T extends string | number | symbol>(
    counts: Record<T, number>,
    element: T,
  ): Record<T, number> => {
    counts[element] = (counts[element] || 0) + 1;
    return counts;
  },
  () => ({}),
);

export const groupByReduce = <T, S, K extends Primitive>(
  key: (_: T) => K,
  reducer: Reducer<T, S>,
  initial: () => S,
): (_: T[]) => Record<K, S> =>
  // @ts-expect-error reason: TODO - fix typing
  groupByManyReduce(pipe(key, wrapArray), reducer, initial);

export const groupByMany = <T, K extends Primitive>(keys: (_: T) => K[]) =>
  groupByManyReduce(
    keys,
    (s: T[], x: T) => {
      s.push(x);
      return s;
    },
    () => [],
  );

export const addEntry =
  <Object, Value>(key: Primitive, value: Value) => (obj: Object) => ({
    ...obj,
    [key]: value,
  });

export const groupBy = <T, K extends Primitive>(f: Unary<T, K>) =>
  // @ts-expect-error reason: TODO - fix typing
  groupByMany<T, K>(pipe(f, wrapArray));

type Node = Primitive;
type Edge = [Node, Node];
export const edgesToGraph = groupByReduce<Edge, Set<Node>, Node>(
  head,
  <Node, Edge extends [Node, Node]>(s: Set<Node>, [_, destination]: Edge) => {
    s.add(destination);
    return s;
  },
  () => new Set(),
);

const onEntries = <
  // deno-lint-ignore no-explicit-any
  Function extends (kvs: [any, any][]) => [any, any][] | Promise<[any, any][]>,
>(
  transformation: Function,
): (
  Obj: Record<
    ElementOf<ParamOf<Function>>[0],
    ElementOf<ParamOf<Function>>[1]
  >,
) => Function extends AsyncFunction ? Promise<
    Record<
      ElementOf<Awaited<ReturnType<Function>>>[0],
      ElementOf<Awaited<ReturnType<Function>>>[1]
    >
  >
  : Record<
    ElementOf<Awaited<ReturnType<Function>>>[0],
    ElementOf<Awaited<ReturnType<Function>>>[1]
  > =>
  // @ts-expect-error: too hard
  pipe(
    Object.entries,
    // @ts-expect-error: too hard
    transformation,
    Object.fromEntries,
  );

export const entryMap = pipe(map, onEntries);

export const entryFilter = <
  Function extends (
    // deno-lint-ignore no-explicit-any
    ((kv: [any, any]) => any)
  ),
>(f: Function) => onEntries(filter(f));

type RecordKey = string | number | symbol;
type EntryMap<
  F,
  OldKey extends RecordKey,
  OldValue,
  NewKey extends RecordKey,
  NewValue,
> = (
  obj: Record<OldKey, OldValue>,
) => F extends AsyncFunction ? Promise<Record<NewKey, NewValue>>
  : Record<NewKey, NewValue>;

type EntryFilter<F, Key extends RecordKey, Value> = (
  obj: Record<Key, Value>,
) => F extends AsyncFunction ? Awaited<Record<Key, Value>>
  : Record<Key, Value>;

export const valFilter = <Key extends RecordKey, F extends Func>(
  f: F,
): EntryFilter<F, Key, ParamOf<F>> =>
  // @ts-expect-error can't infer typing here
  entryFilter(pipe(second, f));

export const keyFilter = <Value, F extends Func>(
  f: F,
): EntryFilter<F, ParamOf<F>, Value> =>
  // @ts-expect-error can't infer typing here
  entryFilter(pipe(head, f));

export const valMap = <Key extends RecordKey, F extends Func>(
  f: F,
): (
  obj: Record<Key, ParamOf<F>>,
) => EntryMap<F, Key, ParamOf<F>, Key, ReturnTypeUnwrapped<F>> =>
  // @ts-expect-error can't infer typing here
  entryMap(stack(identity, f));

export const keyMap = <Value, F extends Func>(
  f: F,
): EntryMap<F, ParamOf<F>, Value, ReturnTypeUnwrapped<F>, Value> =>
  // @ts-expect-error can't infer typing here
  entryMap(stack(f, identity));

// Record is untyped but it should have a recursive definition.
type Tree<Terminal> = Terminal | Tree<Terminal>[] | Record<Primitive, unknown>;

export const mapTerminals =
  <Terminal extends (string | boolean | number | Func)>(
    terminalMapper: (_: Terminal) => unknown,
  ) =>
  (obj: Tree<Terminal>): Tree<unknown> =>
    Array.isArray(obj)
      ? map(mapTerminals(terminalMapper))(obj)
      : typeof obj === "object" && !(obj instanceof Function)
      // @ts-expect-error too complicated
      ? valMap(mapTerminals(terminalMapper))(obj)
      : terminalMapper(obj as Terminal);

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

type SpecType<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? Awaited<R>
    : T[K] extends object ? SpecType<T[K]>
    : never;
};

type IsAsync<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? true
    : T[K] extends object ? IsAsync<T[K]>
    : false;
}[keyof T] extends true ? true : false;

type FinalSpecType<T> = IsAsync<T> extends true ? Promise<SpecType<T>>
  : SpecType<T>;

export const applySpec =
  <T>(spec: T) => (...args: unknown[]): FinalSpecType<T> =>
    // @ts-expect-error too to bother.
    mapTerminals(applyTo(...args))(spec);
