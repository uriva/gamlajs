import { alljuxt, anyjuxt, juxt, juxtCat, pairRight } from "./juxt.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { map } from "./map.ts";
import { multiply } from "./math.ts";
import { pipe } from "./composition.ts";
import { wrapPromise } from "./promise.ts";

Deno.test("async juxt", async () => {
  assertEquals(
    await juxt(wrapPromise, pipe(map(multiply(2)), wrapPromise))([2]),
    [[2], [4]],
  );
});

Deno.test("juxt non unary", () => {
  assertEquals(
    juxt(
      (x, y) => x - y,
      (x, y) => x + y,
    )(3, 2),
    [1, 5],
  );
});

Deno.test("juxtCat", async () => {
  assertEquals(
    await juxtCat(
      (x: number) => wrapPromise([x, x + 1]),
      (x: number) => wrapPromise([x + 2, x + 3]),
    )(1),
    [1, 2, 3, 4],
  );
});

Deno.test("async pairRight", async () => {
  assertEquals(
    await pairRight((x: number) => wrapPromise(x * 2))(5),
    [5, 10],
  );
});

Deno.test("anyjuxt", () => {
  assertEquals(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
    true,
  );
  assertEquals(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(0),
    false,
  );
});

Deno.test("alljuxt", () => {
  assertEquals(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(10),
    true,
  );
  assertEquals(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
    false,
  );
});
