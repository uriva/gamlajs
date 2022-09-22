import {
  applySpec,
  asyncTap,
  asyncTimeit,
  explode,
  filter,
  isValidRegExp,
  keyMap,
  mapTerminals,
  product,
  testRegExp,
  timeit,
  valMap,
} from "./functional";

import { sleep } from "./time";
import { wrapPromise } from "./promise";

test("async filter", async () => {
  expect(
    await filter((arg) => wrapPromise(arg % 2 === 0))([1, 2, 3, 4, 5, 6]),
  ).toEqual([2, 4, 6]);
});

test("key map", () => {
  const result = keyMap((key) => key + "2")({ a: 1, b: [1, 2, 3] });
  expect(result).toEqual({ a2: 1, b2: [1, 2, 3] });
});

test("asyncTap", async () => {
  const result = await asyncTap((x) => wrapPromise(x * 2))(2);
  expect.assertions(1);
  expect(result).toStrictEqual(2);
});

test("testRegExp", () => {
  expect(testRegExp(/asd/)("asd")).toBeTruthy();
  expect(testRegExp(/asd/)("ooo")).toBeFalsy();
});

test("isValidRegExp", () => {
  expect(isValidRegExp("\bhello\b")).toBeTruthy();
  expect(isValidRegExp("?")).toBeFalsy();
  expect(isValidRegExp("a?")).toBeTruthy();
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

test("asyncMapObject", async () => {
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

test("asyncApplySpec", async () => {
  expect(
    await applySpec({
      a: (obj) => wrapPromise(obj.x),
      b: { a: (obj) => wrapPromise(obj.y) },
    })({ x: 1, y: 2 }),
  ).toEqual({ a: 1, b: { a: 2 } });
});

test("product", () => {
  expect(product([])).toEqual([[]]);
  expect(product([[], [1, 2, 3]])).toEqual([]);
  expect(
    product([
      ["a", "b"],
      [1, 2],
    ]),
  ).toEqual([
    ["a", 1],
    ["a", 2],
    ["b", 1],
    ["b", 2],
  ]);
});

test("explode", () => {
  expect(explode(1)(["a", [1, 2, 3], "b"])).toEqual([
    ["a", 1, "b"],
    ["a", 2, "b"],
    ["a", 3, "b"],
  ]);
});

test("timeit", () => {
  const logSpy = jest.spyOn(console, "log");
  timeit(
    (time, args) => console.log(`took some time to run ${args[0]}^${args[1]}`),
    Math.pow,
  )(2, 1000);
  expect(logSpy).toHaveBeenCalledWith("took some time to run 2^1000");
});

test("asyncTimeit", async () => {
  const logSpy = jest.spyOn(console, "log");
  await asyncTimeit(
    (_, args) => console.log(`slept for ${args[0]}ms`),
    sleep,
  )(100);
  expect(logSpy).toHaveBeenCalledWith("slept for 100ms");

  const f = async ({ a, b, c }) => {
    await sleep(100);
    return a + b + c;
  };
  await asyncTimeit(
    (_1, _2, result) => console.log(`slept and returned ${result}`),
    f,
  )({ a: 1, b: 2, c: 3 });
  expect(logSpy).toHaveBeenCalledWith("slept and returned 6");
});
