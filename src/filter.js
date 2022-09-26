import { after, complement, pipe } from "./composition.js";
import { head, second } from "./array.js";

import { map } from "./map.js";
import { pairRight } from "./juxt.js";

export const filter = pipe(
  pairRight,
  map,
  after(pipe((array) => array.filter(second), map(head))),
);

export const remove = pipe(complement, filter);
