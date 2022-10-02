import { map, mapCat } from "./map.js";

import { wrapPromise } from "./promise.js";

test.each([
  [
    [1, 2, 3],
    [2, 4, 6],
  ],
  [[], []],
])("async map with iterable %s", async (it, expected) => {
  expect(await map((input) => wrapPromise(input * 2))(it)).toEqual(expected);
});

test("map doesn't include indices", () => {
  expect(map(parseInt)(["4", "3", "7"])).toEqual([4, 3, 7]);
});

test("mapCat", async () => {
  expect(await mapCat((x) => wrapPromise([x, x + 1]))([1, 2])).toStrictEqual([
    1, 2, 2, 3,
  ]);
});
