import { after, complement, pipe } from "./composition";
import { head, second } from "./array";

import { map } from "./map";
import { pairRight } from "./juxt";

export const filter = pipe(
  pairRight,
  map,
  after(pipe((array) => array.filter(second), map(head))),
);

export const remove = pipe(complement, filter);
