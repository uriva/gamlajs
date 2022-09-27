import { filter, intersectBy } from "./filter.js";

import { prop } from "./operator.js";
import { wrapPromise } from "./promise.js";

test("async filter", async () => {
  expect(
    await filter((arg) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
  ).toEqual([2, 4, 6]);
});

test("intersectBy", () => {
  expect(
    intersectBy(prop("id"))([
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 1 }],
      [{ id: 3 }, { id: 1 }, { id: 4 }],
    ]),
  ).toEqual([{ id: 1 }]);
});
