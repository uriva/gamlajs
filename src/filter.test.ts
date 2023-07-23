import { filter, find, intersectBy } from "./filter.ts";

import { prop } from "./operator.ts";
import { wrapPromise } from "./promise.ts";

test("async filter", async () => {
  expect(
    await filter((arg: number) => wrapPromise(arg % 2 === 0))([
      1, 2, 3, 4, 5, 6,
    ]),
  ).toEqual([2, 4, 6]);
});

test("find", async () => {
  expect(
    await find((arg: number) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
  ).toEqual(2);
  expect(find((arg: number) => arg > 7)([1, 2, 3, 4, 5, 6])).toEqual(undefined);
});

test("intersectBy", () => {
  expect(
    intersectBy(prop<{ id: number }, "id">("id"))([
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 1 }],
      [{ id: 3 }, { id: 1 }, { id: 4 }],
    ]),
  ).toEqual([{ id: 1 }]);
});
