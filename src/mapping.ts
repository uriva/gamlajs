import { Func, Predicate, Unary } from "./typing.ts";
import { applyTo, identity, pipe } from "./composition.ts";
import { head, second, wrapArray } from "./array.ts";

import { Map } from "npm:immutable";
import { filter } from "./filter.ts";
import { map } from "./map.ts";
import { reduce } from "./reduce.ts";
import { stack } from "./juxt.ts";

export const wrapObject = <V>(key: string) => (value: V) => ({ [key]: value });

type Primitive = string | number | symbol;
type Reducer<T, S> = (state: S, element: T) => S;
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
  // @ts-ignore reason: TODO - fix typing
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
  // @ts-ignore reason: TODO - fix typing
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

const onEntries = <OldKey, OldValue, NewKey, NewValue>(
  transformation: (kvs: [OldKey, OldValue][]) => [NewKey, NewValue][],
  // @ts-ignore: TODO - fix
) => pipe(Object.entries, transformation, Object.fromEntries);

// @ts-ignore: TODO - fix
export const entryMap = pipe(map, onEntries);

export const entryFilter = <Key extends RecordKey, Value>(
  f: Predicate<[Key, Value]>,
  // @ts-ignore: TODO - fix
) => pipe(filter, onEntries)(f);

type RecordKey = string | number | symbol;

export const valFilter = <Value>(f: Predicate<Value>) =>
  // @ts-ignore reason: TODO - fix typing
  entryFilter(pipe(second, f));

export const keyFilter = <Key extends RecordKey>(f: Predicate<Key>) =>
  // @ts-ignore reason: TODO - fix typing
  entryFilter(pipe(head, f));

export const valMap = <OldValue, NewValue>(f: (v: OldValue) => NewValue) =>
  // @ts-ignore reason: TODO - fix typing
  entryMap(stack(identity, f));

export const keyMap = <OldKey extends RecordKey, NewKey extends RecordKey>(
  f: (v: OldKey) => NewKey,
): (_: Record<OldKey, unknown>) => Record<NewKey, unknown> =>
  // @ts-ignore reason: TODO - fix typing
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

const setter = <K, V>(obj: Map<K, V>, key: K, value: V) => obj.set(key, value);

const getter =
  <K, V>(constructor: () => V) => (index: Index<K, V>, key: K): V => {
    const val = index.get(key);
    return val === undefined ? constructor() : val as V;
  };

const nonterminalGetter = <K, Terminal>(index: Index<K, Terminal>, key: K) =>
  getter<K, Index<K, Terminal>>(() => Map())(
    index as Index<K, Index<K, Terminal>>,
    key,
  );

type KeyFn<T, K> = (_: T) => K;

const dbReducer = <T, K, Terminal>(
  [key, ...keys]: KeyFn<T, K>[],
  reducer: Reducer<T, Terminal>,
  terminalGetter: (db: Index<K, Terminal>, k: K) => Terminal,
  setter: (
    wrappingDb: Index<K, Terminal>,
    k: K,
    innerDb: Index<K, Terminal> | Terminal,
  ) => Index<K, Terminal>,
  nonterminalGetter: (db: Index<K, Terminal>, key: K) => Index<K, Terminal>,
) =>
(state: Index<K, Terminal>, current: T): Index<K, Terminal> =>
  setter(
    state,
    key(current),
    keys.length
      ? dbReducer(
        keys,
        reducer,
        terminalGetter,
        setter,
        nonterminalGetter,
      )(nonterminalGetter(state, key(current)), current)
      : reducer(terminalGetter(state, key(current)), current),
  );

const query =
  <Terminal, K>(leafConstructor: () => Terminal) =>
  (index: Index<K, Terminal>) =>
  ([key, ...keys]: K[]): Terminal =>
    keys.length
      ? query(leafConstructor)(nonterminalGetter(index, key))(keys)
      : getter(leafConstructor)(index, key);

type Index<K, Terminal> = Map<K, Index<K, Terminal> | Terminal>;
type NonEmptyArray<T> = [T, ...T[]];

export const index = <T, K, Terminal>(
  keys: NonEmptyArray<(x: T) => K>,
  reducer: Reducer<T, Terminal>,
  leafConstructor: () => Terminal,
) => ({
  build: () => Map() as Index<K, Terminal>,
  query: query(leafConstructor),
  insert: (index: Index<K, Terminal>, xs: T[]): Index<K, Terminal> =>
    reduce<Index<K, Terminal>, T, false>(
      dbReducer<T, K, Terminal>(
        keys,
        reducer,
        getter(leafConstructor),
        setter,
        nonterminalGetter,
      ),
      () => index,
    )(xs),
});
