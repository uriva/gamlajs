const {
  asyncApplySpec,
  asyncFilter,
  asyncFirst,
  wrapPromise,
  asyncIfElse,
  asyncJuxt,
  asyncMap,
  asyncMapObjectTerminals,
  asyncPairRight,
  asyncPipe,
  asyncReduce,
  asyncTap,
  asyncValMap,
  asyncUnless,
  asyncWhen,
  contains,
  isValidRegExp,
  juxtCat,
  keyMap,
  mapCat,
  testRegExp,
  zip,
  product,
  explode,
  between,
  renameKeys,
} = require("./functional");
const { equals, multiply, map, unapply, T, F } = require("ramda");

test("test asyncPipe", async () => {
  const result = await asyncPipe(wrapPromise, (input) =>
    Promise.resolve(multiply(input, 2))
  )(2);
  expect.assertions(1);
  expect(result).toBe(4);
});

test("test asyncFirst", async () => {
  const result = await asyncFirst(
    () => Promise.resolve(null),
    wrapPromise
  )([1, 2, 3]);

  expect.assertions(1);
  expect(result).toEqual([1, 2, 3]);
});

test("test asyncFirst all fail", async () => {
  const result = await asyncFirst(() => Promise.resolve(null))(1);

  expect.assertions(1);
  expect(result).toBeFalsy();
});

test("test async map", async () => {
  const result = await asyncMap(
    (input) => Promise.resolve(multiply(input, 2)),
    [1, 2, 3]
  );

  expect.assertions(1);
  expect(result).toEqual([2, 4, 6]);
});

test("test async juxt", async () => {
  const result = await asyncJuxt([
    unapply(wrapPromise),
    unapply((input) => Promise.resolve(map(multiply(2), input))),
  ])(2, 3);

  expect.assertions(1);
  expect(result).toEqual([
    [2, 3],
    [4, 6],
  ]);
});

test("test async filter", async () => {
  const result = await asyncFilter((arg) => Promise.resolve(arg % 2 === 0))([
    1, 2, 3, 4, 5, 6,
  ]);

  expect.assertions(1);
  expect(result).toEqual([2, 4, 6]);
});

test("test key map", () => {
  const result = keyMap((key) => key + "2")({ a: 1, b: [1, 2, 3] });
  expect(result).toEqual({ a2: 1, b2: [1, 2, 3] });
});

test("test async reduce", async () => {
  const result = await asyncReduce(
    (acc, item) => Promise.resolve(acc + item),
    0,
    [1, 2, 3, 4, 5, 6]
  );

  expect.assertions(1);
  expect(result).toEqual(21);
});

test("test async reduce no async input", async () => {
  const result = await asyncReduce(
    (acc, item) => acc + item,
    0,
    [1, 2, 3, 4, 5, 6]
  );

  expect.assertions(1);
  expect(result).toEqual(21);
});

test("test zip", () => {
  expect(zip([1, 2, 3], [0, 0, 0])).toEqual([
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("test asyncPairRight", async () => {
  const result = await asyncPairRight((x) => Promise.resolve(x * 2))(5);
  expect.assertions(1);
  expect(result).toStrictEqual([5, 10]);
});

test("test asyncTap", async () => {
  const result = await asyncTap((x) => Promise.resolve(x * 2))(2);
  expect.assertions(1);
  expect(result).toStrictEqual(2);
});

test("test asyncIfElse", async () => {
  const testFunction = asyncIfElse((x) => Promise.resolve(equals(x, 2)), T, F);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(false);
});

test("test asyncUnless", async () => {
  const testFunction = asyncUnless((x) => Promise.resolve(equals(x, 2)), T);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(2);
  expect(await testFunction(3)).toStrictEqual(true);
});

test("test asyncWhen", async () => {
  const testFunction = asyncWhen((x) => Promise.resolve(equals(x, 2)), T);

  expect.assertions(2);
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(3);
});

test("juxtCat", async () => {
  const testFunction = juxtCat([
    (x) => Promise.resolve([x, x + 1]),
    (x) => Promise.resolve([x + 2, x + 3]),
  ]);

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

test("asyncValMap", async () => {
  expect(
    await asyncValMap((x) => Promise.resolve(x + 1))({ a: 1, b: 3 })
  ).toEqual({
    a: 2,
    b: 4,
  });
});

test("asyncMapObject", async () => {
  expect(
    await asyncMapObjectTerminals((x) => Promise.resolve(x + 1))({
      a: { a: 1, b: 2 },
      b: 3,
      c: [1, 2, 3],
    })
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
    })({ x: 1, y: 2 })
  ).toEqual({ a: 1, b: { a: 2 } });
});

test("product", () => {
  expect(product([])).toEqual([[]]);
  expect(product([[], [1, 2, 3]])).toEqual([]);
  expect(
    product([
      ["a", "b"],
      [1, 2],
    ])
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

test("test renameKeys", () => {
  expect(renameKeys({ b: "bb", c: "cc" }, { a: 1, b: 2, c: 3 })).toEqual({
    a: 1,
    bb: 2,
    cc: 3,
  });
});
