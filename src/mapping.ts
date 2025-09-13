import { head, second, wrapArray } from "./array.ts";
import { applyTo, identity, pipe } from "./composition.ts";
import { filter } from "./filter.ts";
import { stack } from "./juxt.ts";
import { map } from "./map.ts";
import { reduce } from "./reduce.ts";
import type {
  AsyncFunction as _AsyncFunction,
  ElementOf,
  Func,
  IsAsync,
  ParamOf,
  Reducer,
  ReturnTypeUnwrapped,
  Unary,
  UnaryAsync,
} from "./typing.ts";

/** Wrap value into an object with a given key. */
export const wrapObject = <V>(key: string) => (value: V) => ({ [key]: value });

type Primitive = string | number | symbol;

/** Group by multiple keys with a reducer. */
export const groupByManyReduce = <T, S, K extends Primitive>(
  keys: (_: T) => K[],
  reducer: Reducer<T, S>,
  initial: () => S,
) =>
(it: T[]): Record<K, S> => {
  const result = {} as Record<K, S>;
  for (const x of it) {
    for (const key of keys(x)) {
      result[key] = reducer(key in result ? result[key] : initial(), x);
    }
  }
  return result;
};

/** Count occurrences of values in an array. */
export const count: <T extends string | number | symbol>(
  xs: T[],
) => Record<T, number> = reduce(
  <T extends string | number | symbol>(
    counts: Record<T, number>,
    element: T,
  ): Record<T, number> => {
    counts[element] = (counts[element] || 0) + 1;
    return counts;
  },
  () => ({}),
);

/** Group by a single key with a reducer. */
export const groupByReduce = <T, S, K extends Primitive>(
  key: (_: T) => K,
  reducer: Reducer<T, S>,
  initial: () => S,
): (_: T[]) => Record<K, S> =>
  // @ts-expect-error reason: TODO - fix typing
  groupByManyReduce(pipe(key, wrapArray), reducer, initial);

/** Group by multiple keys into arrays. */
export const groupByMany = <T, K extends Primitive>(
  keys: (_: T) => K[],
): (xs: T[]) => Record<K, T[]> =>
  groupByManyReduce(
    keys,
    (s: T[], x: T) => {
      s.push(x);
      return s;
    },
    () => [],
  );

/** Add or overwrite an entry in an object. */
export const addEntry =
  <Object, Value>(key: Primitive, value: Value) => (obj: Object) => ({
    ...obj,
    [key]: value,
  });

/** Group by a key into arrays. */
export const groupBy = <T, K extends Primitive>(
  f: Unary<T, K>,
): (xs: T[]) => Record<K, T[]> =>
  // @ts-expect-error reason: TODO - fix typing
  groupByMany<T, K>(pipe(f, wrapArray));

type Node = Primitive;
type Edge = [Node, Node];
/** Convert edge list into an adjacency map. */
export const edgesToGraph: (xs: Edge[]) => Record<Node, Set<Node>> =
  groupByReduce<Edge, Set<Node>, Node>(
    head,
    <Node, Edge extends [Node, Node]>(s: Set<Node>, [_, destination]: Edge) => {
      s.add(destination);
      return s;
    },
    () => new Set(),
  );

const onEntries = <
  // deno-lint-ignore no-explicit-any
  F extends (kvs: [any, any][]) => [any, any][] | Promise<[any, any][]>,
>(
  transformation: F,
): (
  Obj: Record<
    ElementOf<ParamOf<F>>[0],
    ElementOf<ParamOf<F>>[1]
  >,
) => IsAsync<F> extends true ? Promise<
    Record<
      ElementOf<Awaited<ReturnType<F>>>[0],
      ElementOf<Awaited<ReturnType<F>>>[1]
    >
  >
  : Record<
    ElementOf<Awaited<ReturnType<F>>>[0],
    ElementOf<Awaited<ReturnType<F>>>[1]
  > =>
  // @ts-expect-error: too hard
  pipe(
    Object.entries,
    // @ts-expect-error: too hard
    transformation,
    Object.fromEntries,
  );

/** Map over object entries using a key/value transforming function. */
export const entryMap: Func = pipe(map, onEntries) as unknown as Func;

/** Filter object entries by a predicate over [key,value]. */
export const entryFilter: Func = pipe(filter, onEntries) as unknown as Func;

type RecordKey = string | number | symbol;
type EntryMap<
  F extends Func,
  OldKey extends RecordKey,
  OldValue,
  NewKey extends RecordKey,
  NewValue,
> = (
  obj: Record<OldKey, OldValue>,
) => true extends IsAsync<F> ? Promise<Record<NewKey, NewValue>>
  : Record<NewKey, NewValue>;

type EntryFilter<F extends Func, Key extends RecordKey, Value> = (
  obj: Record<Key, Value>,
) => true extends IsAsync<F> ? Awaited<Record<Key, Value>>
  : Record<Key, Value>;

/** Filter object by value predicate. */
export const valFilter = <Key extends RecordKey, F extends Func>(
  f: F,
): EntryFilter<F, Key, ParamOf<F>> => entryFilter(pipe(second, f));

/** Filter object by key predicate. */
export const keyFilter = <Value, F extends Func>(
  f: F,
): EntryFilter<F, ParamOf<F>, Value> => entryFilter(pipe(head, f));

/** Map values in an object. */
export const valMap = <Key extends RecordKey, OldValue, NewValue>(
  f: (old: OldValue) => NewValue | ((old: OldValue) => Promise<NewValue>),
): EntryMap<typeof f, Key, OldValue, Key, NewValue> =>
  entryMap(stack(identity, f));

/** Map keys in an object. */
export const keyMap = <Value, F extends Func>(
  f: F,
): EntryMap<F, ParamOf<F>, Value, ReturnTypeUnwrapped<F>, Value> =>
  entryMap(stack(f, identity));

// Record is untyped but it should have a recursive definition.
type Tree<Terminal> = Terminal | Tree<Terminal>[] | Record<Primitive, unknown>;

/** Recursively map terminal values within an object/array tree. */
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

type IsAsyncSpec<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? true
    : T[K] extends object ? IsAsyncSpec<T[K]>
    : false;
}[keyof T] extends true ? true : false;

type FinalSpecType<T> = IsAsyncSpec<T> extends true ? Promise<SpecType<T>>
  : SpecType<T>;

/** Build a function from a spec tree of functions. */
export const applySpec =
  <T>(spec: T) => (...args: unknown[]): FinalSpecType<T> =>
    // @ts-expect-error too to bother.
    mapTerminals(applyTo(...args))(spec);

/** Map over array with async function sequentially. */
export const sequentialMap =
  <F extends UnaryAsync>(f: F) =>
  async (xs: Parameters<F>[0][]): Promise<Awaited<ReturnType<F>>[]> => {
    const result = [];
    for (const x of xs) result.push(await f(x));
    return result;
  };
