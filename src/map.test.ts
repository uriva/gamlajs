import { each, map, mapCat } from "./map.ts";

import { assertEquals } from "std-assert";
import { wrapPromise } from "./promise.ts";
import { pipe } from "./composition.ts";
import { assert } from "./debug.ts";

[
  [
    [1, 2, 3],
    [2, 4, 6],
  ],
  [[], []],
].forEach(([it, expected], i) => {
  Deno.test(`async map with iterable ${i}`, async () => {
    assertEquals(
      await map((input: number) => wrapPromise(input * 2))(it),
      expected,
    );
  });
});

[
  [1, 2, 3],
  [],
].forEach((it, i) => {
  Deno.test(`each with iterable ${i}`, () => {
    const results: number[] = [];
    each((input: number) => results.push(input))(it);
    assertEquals(results, it);
  });
});

[
  [1, 2, 3],
  [],
].forEach((it, i) => {
  Deno.test(`each async with iterable ${i}`, async () => {
    const results: number[] = [];
    await each((input: number): Promise<void> => {
      results.push(input);
      return Promise.resolve();
    })(it);
    assertEquals(results, it);
  });
});

Deno.test("map doesn't include indices", () => {
  assertEquals(map(parseInt)(["4", "3", "7"]), [4, 3, 7]);
});

Deno.test("mapCat", async () => {
  assertEquals(
    await mapCat((x: number) => wrapPromise([x, x + 1]))([
      1,
      2,
    ]),
    [1, 2, 2, 3],
  );
});
