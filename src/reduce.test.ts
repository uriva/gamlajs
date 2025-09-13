import { assertEquals } from "@std/assert";
import { wrapPromise } from "./promise.ts";
import { max, min, reduce } from "./reduce.ts";

Deno.test("reduce", () => {
  const additionReducer = (acc: number, item: number) => acc + item;
  assertEquals(
    reduce(additionReducer, () => 0)([1, 2, 3, 4, 5, 6]),
    21,
  );
});

Deno.test("min", () => {
  assertEquals(min((x: number) => x)([4, 1, 2, 3]), 1);
});

Deno.test("reduce async", async () => {
  const delayedAddition = (acc: number, item: number): Promise<number> =>
    wrapPromise(acc + item);
  assertEquals(
    await reduce(delayedAddition, () => 0)([1, 2, 3, 4, 5, 6]),
    21,
  );
});

Deno.test("min", () => {
  assertEquals(min((x: number) => x)([4, 1, 2, 3]), 1);
});

Deno.test("max async", async () => {
  assertEquals(await (max((x) => wrapPromise(x))([4, 1, 2, 3])), 4);
});

Deno.test("min async", async () => {
  assertEquals(await (min((x) => wrapPromise(x))([4, 1, 2, 3])), 1);
});

Deno.test("max call stack is not a limit on array size", () => {
  const bigArray = [];
  const size = 1000000;
  for (let i = 0; i < size; i++) {
    bigArray.push(i);
  }
  assertEquals(max((x: number) => x)(bigArray), size - 1);
});

const _1: number = min((x: number) => x)([1, 2, 3, 4]);
const _2: number = max((x: number) => x)([1, 2, 3, 4]);
const _3: Promise<number> = min((x: number) => Promise.resolve(x))([
  1,
  2,
  3,
  4,
]);
const _4: Promise<number> = max((x: number) => Promise.resolve(x))([
  1,
  2,
  3,
  4,
]);
