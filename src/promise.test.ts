import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { isPromise } from "./promise.ts";

Deno.test("isPromise", () => {
  assertEquals(isPromise({ then: "hello" }), false);
  assertEquals(isPromise(new Promise(() => {})), true);
});
