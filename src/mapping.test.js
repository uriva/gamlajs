import { applySpec, index, keyMap, mapTerminals, valMap } from "./mapping.js";
import { head, second } from "./array.js";

import { wrapPromise } from "./promise.js";

test("keyMap", () => {
  expect(keyMap((key) => key + "2")({ a: 1, b: [1, 2, 3] })).toEqual({
    a2: 1,
    b2: [1, 2, 3],
  });
});

test.each([
  [
    { a: 1, b: 3 },
    { a: 2, b: 4 },
  ],
  [{}, {}],
])("valMap async with input %s", async (obj, expected) => {
  expect(await valMap((x) => wrapPromise(x + 1))(obj)).toEqual(expected);
});

test("mapTerminals async", async () => {
  expect(
    await mapTerminals((x) => wrapPromise(x + 1))({
      a: { a: 1, b: 2 },
      b: 3,
      c: [1, 2, 3],
    }),
  ).toEqual({
    a: { a: 2, b: 3 },
    b: 4,
    c: [2, 3, 4],
  });
});

test("applySpec async", async () => {
  expect(
    await applySpec({
      a: (obj) => wrapPromise(obj.x),
      b: { a: (obj) => wrapPromise(obj.y) },
    })({ x: 1, y: 2 }),
  ).toEqual({ a: 1, b: { a: 2 } });
});

test("index", () => {
  const builtIndex = index(
    head,
    second,
  )([
    [1, 2, 8],
    [3, 4, 7],
    [1, 2, 5],
  ]);
  expect(builtIndex(3)(4)).toEqual([[3, 4, 7]]);
  expect(builtIndex(1)(2)).toEqual([
    [1, 2, 8],
    [1, 2, 5],
  ]);
  expect(builtIndex(9)(15)).toEqual([]);
});
