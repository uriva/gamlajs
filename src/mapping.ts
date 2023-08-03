import {
  AsyncFunction,
  ElementOf,
  Func,
  ParamOf,
  Reducer,
  Unary,
} from "./typing.ts";
import { filter, Predicate } from "./filter.ts";
import { applyTo, identity, pipe } from "./composition.ts";
import { head, second, wrapArray } from "./array.ts";

import { map } from "./map.ts";
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
    | ((kv: [any, any]) => boolean)
    // deno-lint-ignore no-explicit-any
    | ((kv: [any, any]) => Promise<boolean>)
  ),
>(f: Function) => onEntries(filter(f));

type RecordKey = string | number | symbol;

export const valFilter = (f: Predicate) =>
  // @ts-expect-error reason: TODO - fix typing
  entryFilter(pipe(second, f));

export const keyFilter = <Function>(f: Function) =>
  // @ts-expect-error reason: TODO - fix typing
  entryFilter(pipe(head, f));

export const valMap = <OldValue, NewValue>(f: (v: OldValue) => NewValue) =>
  entryMap(stack(identity, f));

export const keyMap = <OldKey extends RecordKey, NewKey extends RecordKey>(
  f: (v: OldKey) => NewKey,
): (_: Record<OldKey, unknown>) => Record<NewKey, unknown> =>
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
      ? valMap(mapTerminals(terminalMapper))(obj)
      : terminalMapper(obj as Terminal);

export const applySpec =
  <Args extends unknown[]>(spec: Tree<(..._: Args) => unknown>) =>
  // @ts-ignore reason: difference between deno compiler and node
  (...args: Args) => mapTerminals(applyTo(...args))(spec);
