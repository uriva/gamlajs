import { assertEquals } from "std-assert";
import { removeKey } from "./object.ts";

Deno.test("remove key", () => {
  type t = { a?: number; b: number };
  assertEquals(
    removeKey<t>(
      "a",
    )({ a: 1, b: 2 }),
    { b: 2 },
  );
});
