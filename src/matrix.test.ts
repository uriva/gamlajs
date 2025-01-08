import { pipe } from "./composition.ts";
import { explode, product } from "./matrix.ts";

import { assertEquals } from "std-assert";

Deno.test("product", () => {
  assertEquals(product([]), [[]]);
  assertEquals(product([[], [1, 2, 3]]), []);
  assertEquals(
    product([
      ["a", "b"],
      [1, 2],
    ]),
    [
      ["a", 1],
      ["a", 2],
      ["b", 1],
      ["b", 2],
    ],
  );
});

Deno.test("explode", () => {
  const explode1 = explode<[string, number, string]>(1);
  assertEquals(
    explode1(["a", [1, 2, 3], "b"]),
    [["a", 1, "b"], ["a", 2, "b"], [
      "a",
      3,
      "b",
    ]] as ([string, number, string][]),
  );
});
