import { AsyncFunction, BooleanEquivalent, ParamOf } from "./typing.ts";
import { complement, pipe } from "./composition.ts";
import { head, second } from "./array.ts";

import { map } from "./map.ts";
import { pairRight } from "./juxt.ts";

export type Predicate =
  // deno-lint-ignore no-explicit-any
  | ((_: any) => BooleanEquivalent)
  // deno-lint-ignore no-explicit-any
  | ((_: any) => Promise<BooleanEquivalent>);

export const filter = <F extends Predicate>(f: F): (
  _: ParamOf<F>[],
) => F extends AsyncFunction ? Promise<ParamOf<F>[]> : ParamOf<F>[] =>
  // @ts-ignore typing head is hard.
  pipe(
    map(pairRight(f)),
    (array) => array.filter(second),
    map(head),
  );

export const find = <Fn extends Predicate>(predicate: Fn) =>
  pipe(filter(predicate), head);

export const remove = pipe(complement, filter);

type Primitive = string | number | boolean | null | undefined;

const toContainmentCheck = <T>(xs: T[]) => {
  const set = new Set(xs);
  return (k: T) => set.has(k);
};

export const intersectBy = <T>(f: (x: T) => Primitive) => (arrays: T[][]) =>
  arrays.reduce((current, next) =>
    current.filter(pipe(f, toContainmentCheck(next.map(f))))
  );
