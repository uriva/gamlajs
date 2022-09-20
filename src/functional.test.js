import { F, T, equals } from "ramda";
import {
  asyncApplySpec,
  asyncFilter,
  asyncFirst,
  asyncIfElse,
  asyncMapObjectTerminals,
  asyncPairRight,
  asyncTap,
  asyncTimeit,
  asyncUnless,
  asyncValMap,
  asyncWhen,
  between,
  contains,
  explode,
  isValidRegExp,
  juxt,
  juxtCat,
  keyMap,
  map,
  mapCat,
  product,
  testRegExp,
  timeit,
  zip,
} from "./functional";

import { multiply } from "./math";
import { pipe } from "./composition";
import { sleep } from "./time";
import { wrapPromise } from "./promise";

test("asyncFirst", async () => {
  const result = await asyncFirst(
    () => Promise.resolve(null),
    wrapPromise,
  )([1, 2, 3]);
  expect.assertions(1);
  expect(result).toEqual([1, 2, 3]);
});

test("asyncFirst all fail", async () => {
  const result = await asyncFirst(() => Promise.resolve(null))(1);

  expect.assertions(1);
  expect(result).toBeFalsy();
});

test.each([
  [
    [1, 2, 3],
    [2, 4, 6],
  ],
  [[], []],
])("async map with iterable %s", async (it, expected) => {
  const result = await map((input) => Promise.resolve(input * 2))(it);
  expect.assertions(1);
  expect(result).toEqual(expected);
});

test("async juxt", async () => {
  expect(
    await juxt(wrapPromise, pipe(map(multiply(2)), wrapPromise))([2]),
  ).toEqual([[2], [4]]);
});

test("juxt non unary", () => {
  expect(
    juxt(
      (x, y) => x - y,
      (x, y) => x + y,
    )(3, 2),
  ).toEqual([1, 5]);
});

test("async filter", async () => {
  const result = await asyncFilter((arg) => Promise.resolve(arg % 2 === 0))([
    1, 2, 3, 4, 5, 6,
  ]);

  expect.assertions(1);
  expect(result).toEqual([2, 4, 6]);
});

test("key map", () => {
  const result = keyMap((key) => key + "2")({ a: 1, b: [1, 2, 3] });
  expect(result).toEqual({ a2: 1, b2: [1, 2, 3] });
});

test("zip", () => {
  expect(zip([1, 2, 3], [0, 0, 0])).toEqual([
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("asyncPairRight", async () => {
  const result = await asyncPairRight((x) => Promise.resolve(x * 2))(5);
  expect.assertions(1);
  expect(result).toStrictEqual([5, 10]);
});

test("asyncTap", async () => {
  const result = await asyncTap((x) => Promise.resolve(x * 2))(2);
  expect.assertions(1);
  expect(result).toStrictEqual(2);
});

test("asyncIfElse", async () => {
  const testFunction = asyncIfElse((x) => Promise.resolve(equals(x, 2)), T, F);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(false);
});

test("asyncUnless", async () => {
  const testFunction = asyncUnless((x) => Promise.resolve(equals(x, 2)), T);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(2);
  expect(await testFunction(3)).toStrictEqual(true);
});

test("asyncWhen", async () => {
  const testFunction = asyncWhen((x) => Promise.resolve(equals(x, 2)), T);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(3);
});

test("juxtCat", async () => {
  const testFunction = juxtCat(
    (x) => Promise.resolve([x, x + 1]),
    (x) => Promise.resolve([x + 2, x + 3]),
  );

  expect.assertions(1);
  expect(await testFunction(1)).toStrictEqual([1, 2, 3, 4]);
});

test("mapCat", async () => {
  const testFunction = mapCat((x) => Promise.resolve([x, x + 1]));

  expect.assertions(1);
  expect(await testFunction([1, 2])).toStrictEqual([1, 2, 2, 3]);
});

test("contains", () => {
  expect.assertions(2);
  expect(contains([1, 2, 3])(1)).toBeTruthy();
  expect(contains([1, 2, 3])(4)).toBeFalsy();
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
])("asyncValMap with input %s", async (obj, expected) => {
  expect(await asyncValMap((x) => Promise.resolve(x + 1))(obj)).toEqual(
    expected,
  );
});

test("asyncMapObject", async () => {
  expect(
    await asyncMapObjectTerminals((x) => Promise.resolve(x + 1))({
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
    await asyncApplySpec({
      a: (obj) => Promise.resolve(obj.x),
      b: { a: (obj) => Promise.resolve(obj.y) },
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

test("between", () => {
  expect(between([1, 2])(1)).toBeTruthy();
  expect(between([1, 2])(2)).toBeFalsy();
  expect(between([1, 4])(2.5)).toBeTruthy();
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
