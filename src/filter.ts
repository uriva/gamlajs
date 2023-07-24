import { complement, pipe } from "./composition.ts";
import { head, second } from "./array.ts";

import { Unary } from "./typing.ts";
import { map } from "./map.ts";
import { pairRight } from "./juxt.ts";

export const filter = <Input, Output>(
  f: Unary<Input, Output>,
) =>
  pipe(
    map(pairRight(f)),
    (array: [Input, Awaited<Output>][]) => array.filter(second),
    map(head),
  );

export const find = <T>(predicate: (x: T) => boolean | Promise<boolean>) =>
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
