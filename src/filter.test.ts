import { filter, find, intersectBy, remove } from "./filter.ts";

import { assertEquals } from "std-assert";
import { prop } from "./operator.ts";
import { wrapPromise } from "./promise.ts";

Deno.test("async filter", async () => {
  assertEquals(
    await filter((arg: number) => wrapPromise(arg % 2 === 0))([
      1,
      2,
      3,
      4,
      5,
      6,
    ]),
    [2, 4, 6],
  );
});

const _nums: number[] = remove((x: number) => x > 0)([1, 2, 3]);

// @ts-expect-error should preserve typing information
const _strings: string[] = remove((x: number) => x > 0)([1, 2, 3]);

const _strings_promise: Promise<number[]> = remove((x: number) =>
  Promise.resolve(x > 0)
)([1, 2, 3]);

const _predicateTyping: 1[] = filter((x: number) => x == 1)([1, 2, 3]);

Deno.test("async filter", async () => {
  assertEquals(
    await remove((arg: number) => wrapPromise(arg % 2 === 0))([
      1,
      2,
      3,
      4,
      5,
      6,
    ]),
    [1, 3, 5],
  );
});

Deno.test("find async", async () => {
  assertEquals(
    await find((arg: number) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
    2,
  );
  assertEquals(
    await find((arg: number) => wrapPromise(arg > 7))([1, 2, 3, 4, 5, 6]),
    undefined,
  );
});

Deno.test("find sync", () => {
  assertEquals(find((arg: number) => arg > 7)([1, 2, 3, 4, 5, 6]), undefined);
  assertEquals(find((arg: number) => arg > 2)([1, 2, 3, 4, 5, 6]), 3);
});

const _numOrUndefined: number | undefined = find((x: number) => x > 0)([
  1,
  2,
  3,
]);

Deno.test("intersectBy", () => {
  assertEquals(
    intersectBy(prop<{ id: number }>()("id"))([
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 1 }],
      [{ id: 3 }, { id: 1 }, { id: 4 }],
    ]),
    [{ id: 1 }],
  );
});
