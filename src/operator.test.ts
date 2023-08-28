import { between, modulo, prop, spread } from "./operator.ts";

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
  assertEquals(prop<{ a: number }>()("a")({ a: 1 }), 1);
});

const assertString = (x: string) => x;

const _: number = prop<{ a: number }>()("a")({ a: 1 });
// @ts-expect-error: type does not match
assertString(prop<{ a: number }>()("a")({ a: 1 }));

spread((x: string, y: number) => x + y)(["a", 1]);
// @ts-expect-error retains input type
spread((x: string, y: number) => x + y)(["a", "a"]);
const _1: string = spread((x: string, y: number) => x + y)(["a", 1]);
// @ts-expect-error retains output type
const _2: number = spread((x: string, y: number) => x + y)(["a", 1]);
