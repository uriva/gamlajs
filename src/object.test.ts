import { assertEquals } from "std-assert";
import { removeKey } from "./object.ts";

type t = { a?: number; b: number };

Deno.test("remove key", () => {
  assertEquals(
    removeKey<t>(
      "a",
    )({ a: 1, b: 2 }),
    { b: 2 },
  );
});

const x = removeKey<t>("b")({ a: 1, b: 2 });
