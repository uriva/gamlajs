import {
  addEntry,
  applySpec,
  edgesToGraph,
  groupBy,
  index,
  keyFilter,
  keyMap,
  mapTerminals,
  valFilter,
  valMap,
  wrapObject,
} from "./mapping.js";
import { head, second } from "./array.ts";

import { wrapPromise } from "./promise.ts";

test("keyFilter", () => {
  expect(keyFilter((key) => key === "b")({ a: 1, b: [1, 2, 3] })).toEqual({
    b: [1, 2, 3],
  });
});

test.each([
  [{ a: 1, b: 3 }, { b: 3 }],
  [{}, {}],
])("valFilter async with input %s", async (obj, expected) => {
  expect(await valFilter((x) => wrapPromise(x > 2))(obj)).toEqual(expected);
});

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
  const { build, query, insert } = index({
    keys: [head, second],
    reducer: (x, y) => {
      x.push(y);
      return x;
    },
    leafConstructor: () => [],
  });
  const queryDb = query(
    insert(build(), [
      [1, 2, 8],
      [3, 4, 7],
      [1, 2, 5],
    ]),
  );
  expect(queryDb([3, 4])).toEqual([[3, 4, 7]]);
  expect(queryDb([1, 2])).toEqual([
    [1, 2, 8],
    [1, 2, 5],
  ]);
  expect(queryDb([9, 15])).toEqual([]);
});

test("groupBy", () => {
  expect(groupBy(head)(["cow", "cat", "dog"])).toEqual({
    c: ["cow", "cat"],
    d: ["dog"],
  });
});

test("wrapObject", () => {
  expect(wrapObject("a")(1)).toEqual({ a: 1 });
});

test("addEntry", () => {
  expect(addEntry("a", "b")({ c: "d" })).toEqual({ a: "b", c: "d" });
});

test("edgesToGraph", () => {
  expect(
    edgesToGraph([
      [1, 2],
      [1, 3],
      [4, 4],
      [2, 3],
    ]),
  ).toEqual({ 1: new Set([2, 3]), 2: new Set([3]), 4: new Set([4]) });
});
