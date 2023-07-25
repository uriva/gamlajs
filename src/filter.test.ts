import { filter, find, intersectBy } from "./filter.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
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

Deno.test("find", async () => {
  assertEquals(
    await find((arg: number) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
    2,
  );
  assertEquals(find((arg: number) => arg > 7)([1, 2, 3, 4, 5, 6]), undefined);
});

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
