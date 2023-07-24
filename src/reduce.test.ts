import { max, min, reduce } from "./reduce.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { wrapPromise } from "./promise.ts";

Deno.test("reduce", () => {
  const additionReducer = (acc: number, item: number) => acc + item;
  assertEquals(
    reduce<number, number, false>(additionReducer, () => 0)([1, 2, 3, 4, 5, 6]),
    21,
  );
});

Deno.test("min", () => {
  assertEquals(min<number>((x) => x)([4, 1, 2, 3]), 1);
});

Deno.test("max async", () => {
  assertEquals(max<number>((x) => wrapPromise(x))([4, 1, 2, 3]), 4);
});

Deno.test("reduce async", async () => {
  const delayedAddition = (acc: number, item: number): Promise<number> =>
    wrapPromise(acc + item);
  assertEquals(
    await reduce<number, number, true>(
      delayedAddition,
      () => 0,
    )([1, 2, 3, 4, 5, 6]),
    21,
  );
});

Deno.test("min", () => {
  assertEquals(min<number>((x) => x)([4, 1, 2, 3]), 1);
});

Deno.test("max async", () => {
  assertEquals(max<number>((x) => wrapPromise(x))([4, 1, 2, 3]), 4);
});

Deno.test("max call stack is not a limit on array size", () => {
  const bigArray = [];
  const size = 1000000;
  for (let i = 0; i < size; i++) {
    bigArray.push(i);
  }
  assertEquals(max<number>((x) => x)(bigArray), size - 1);
});
