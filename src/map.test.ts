import { map, mapCat } from "./map.ts";

import { assertEquals } from "std-assert";
import { wrapPromise } from "./promise.ts";

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
