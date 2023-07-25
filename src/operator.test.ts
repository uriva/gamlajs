import { between, modulo, prop } from "./operator.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";

Deno.test("between", () => {
  assertEquals(between(1, 2)(1), true);
  assertEquals(between(1, 2)(2), false);
  assertEquals(between(1, 4)(2.5), true);
});

Deno.test("modulo", () => {
  assertEquals(modulo(2)(5), 1);
});

Deno.test("prop", () => {
  assertEquals(prop("a")({ a: 1 }), 1);
});

const _1: number = prop("a")({ a: 1 });
// @ts-expect-error: type does not match
const _2: string = prop<{ a: number }>("a")({ a: 1 });
