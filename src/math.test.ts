import { assert, assertEquals } from "@std/assert";
import { randomInt } from "./math.ts";

Deno.test("randomInt returns integers in range", () => {
  const results = Array.from({ length: 200 }, () => randomInt(3));
  results.forEach((result) => {
    assert(Number.isInteger(result));
    assert(result >= 0);
    assert(result <= 3);
  });
});

Deno.test("randomInt with zero always returns zero", () => {
  assertEquals(randomInt(0), 0);
});
