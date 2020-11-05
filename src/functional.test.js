const {
  asyncFirst,
  asyncPipe,
  asyncIdentity,
  asyncJuxt,
  asyncMap,
  asyncFilter,
  keyMap,
  asyncReduce,
  zip,
  asyncPairRight,
  asyncTap,
} = require("./functional");
const { multiply, map, unapply } = require("ramda");

test("test asyncPipe", async () => {
  const result = await asyncPipe(asyncIdentity, (input) =>
    Promise.resolve(multiply(input, 2))
  )(2);
  expect.assertions(1);
  expect(result).toBe(4);
});

test("test asyncFirst", async () => {
  const result = await asyncFirst(
    () => Promise.resolve(null),
    asyncIdentity
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
    unapply(asyncIdentity),
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
    1,
    2,
    3,
    4,
    5,
    6,
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
  const result = await asyncReduce((acc, item) => acc + item, 0, [
    1,
    2,
    3,
    4,
    5,
    6,
  ]);

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
