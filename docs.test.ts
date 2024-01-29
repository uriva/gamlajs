import { complement, pipe } from "./src/composition.ts";

import { anyjuxt } from "./src/juxt.ts";
import { assertEquals } from "std-assert";
import { equals } from "./src/operator.ts";
import { filter } from "./src/filter.ts";
import { reduce } from "./src/reduce.ts";
import { split } from "./src/string.ts";

Deno.test("check docs example works", async () => {
  const histogram = pipe(
    split(""),
    filter(complement(anyjuxt(equals(" "), equals("'")))),
    reduce(
      (x, y): Promise<Record<string, number>> =>
        Promise.resolve({ ...x, [y]: (x[y] || 0) + 1 }),
      () => ({}),
    ),
  );

  assertEquals(
    await histogram("let's see how many times each letter appears here"),
    {
      l: 2,
      e: 10,
      t: 4,
      s: 4,
      h: 3,
      o: 1,
      w: 1,
      m: 2,
      a: 4,
      n: 1,
      y: 1,
      i: 1,
      c: 1,
      r: 3,
      p: 2,
    },
  );
});
