import { after, applyTo, before, identity, pipe } from "./composition.ts";
import { head, second, wrapArray } from "./array.ts";

import { Map } from "immutable";
import { filter } from "./filter.ts";
import { map } from "./map.ts";
import { reduce } from "./reduce.ts";
import { stack } from "./juxt.ts";

export const wrapObject = (key: string) => (value: any) => ({ [key]: value });

type Primitive = string | number | symbol;
type Reducer<T, S> = (state: S, element: T) => S;
export const groupByManyReduce =
  <T, S, K extends Primitive>(
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
) => groupByManyReduce(pipe(key, wrapArray), reducer, initial);

export const groupByMany = <T, K extends Primitive>(keys: (_: T) => K[]) =>
  groupByManyReduce(
    keys,
    (s: T[], x: T) => {
      s.push(x);
      return s;
    },
    () => [],
  );

export const addEntry = (key: Primitive, value: any) => (obj: Object) => ({
  ...obj,
  [key]: value,
});

export const groupBy = pipe(after(wrapArray), groupByMany);

type Node = Primitive;
type Edge = [Node, Node];
export const edgesToGraph = pipe(
  groupByReduce<Edge, Set<Node>, Node>(
    head,
    <Node, Edge extends [Node, Node]>(s: Set<Node>, [_, destination]: Edge) => {
      s.add(destination);
      return s;
    },
    () => new Set(),
  ),
);

const onEntries = <OldKey, OldValue, NewKey, NewValue>(
  transformation: (kvs: [OldKey, OldValue][]) => [NewKey, NewValue][],
  // @ts-ignore
) => pipe(Object.entries, transformation, Object.fromEntries);

// @ts-ignore
export const entryMap = pipe(map, onEntries);
export const entryFilter = pipe(filter, onEntries);

export const valFilter = pipe(before(second), entryFilter);
export const keyFilter = pipe(before(head), entryFilter);

export const valMap = <Value>(f: (v: Value) => any) =>
  entryMap(stack(identity, f));
export const keyMap = <Key>(f: (v: Key) => any) => entryMap(stack(f, identity));

// See MDN Object constructor.
const isObject = (obj: any) => obj === Object(obj);

// Record is untyped but it should have a recursive definition.
type Tree<Terminal> = Terminal | Tree<Terminal>[] | Record<Primitive, unknown>;

export const mapTerminals =
  <Terminal>(terminalMapper: (_: Terminal) => any) =>
  (obj: Tree<Terminal>): Tree<any> =>
    Array.isArray(obj)
      ? map(mapTerminals(terminalMapper))(obj)
      : isObject(obj) && !(obj instanceof Function)
      ? valMap(mapTerminals(terminalMapper))(obj)
      : terminalMapper(obj as Terminal);

export const applySpec =
  <Args extends any[]>(spec: Tree<(..._: Args) => any>) =>
  (...args: Args) =>
    mapTerminals(applyTo(...args))(spec);

const setter = <K, V>(obj: Map<K, V>, key: K, value: V) => obj.set(key, value);

const getter =
  <K, V>(constructor: () => V) =>
  (index: Index<K, V>, key: K) =>
    replaceIfUndefined(index.get(key), constructor());

const nonterminalGetter = <K, Terminal>(index: Index<K, Terminal>, key: K) =>
  getter<K, Index<K, Terminal>>(() => Map())(
    index as Index<K, Index<K, Terminal>>,
    key,
  );

type KeyFn<T, K> = (_: T) => K;

const dbReducer =
  <T, K, Terminal>(
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

const replaceIfUndefined = (value: any, replacement: any) =>
  value === undefined ? replacement : value;

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
