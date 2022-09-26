import { filter } from "./filter.js";
import { wrapPromise } from "./promise.js";

test("async filter", async () => {
  expect(
    await filter((arg) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
  ).toEqual([2, 4, 6]);
});
