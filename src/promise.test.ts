import { assertEquals } from "std-assert";
import { isPromise } from "./promise.ts";

Deno.test("isPromise", () => {
  assertEquals(isPromise({ then: "hello" }), false);
  assertEquals(isPromise(new Promise(() => {})), true);
});
