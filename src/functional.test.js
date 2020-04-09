const {
  asyncFirst,
  asyncPipe,
  asyncIdentity,
  asyncJuxt,
  asyncMap,
  asyncFilter,
  keyMap
} = require("./functional");
const { multiply, map } = require("ramda");

test("test asyncPipe", async () => {
  const result = await asyncPipe(asyncIdentity, input =>
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
  const result = await asyncMap(input => Promise.resolve(multiply(input, 2)), [
    1,
    2,
    3
  ]);

  expect.assertions(1);
  expect(result).toEqual([2, 4, 6]);
});

test("test async juxt", async () => {
  const result = await asyncJuxt([
    asyncIdentity,
    input => Promise.resolve(map(multiply(2), input))
  ])(2, 3);

  expect.assertions(1);
  expect(result).toEqual([
    [2, 3],
    [4, 6]
  ]);
});

test("test async filter", async () => {
  const result = await asyncFilter(arg => Promise.resolve(arg % 2 === 0))([
    1,
    2,
    3,
    4,
    5,
    6
  ]);

  expect.assertions(1);
  expect(result).toEqual([2, 4, 6]);
});

test("test key map", () => {
  const result = keyMap(key => key + "2")({ a: 1, b: [1, 2, 3] });
  expect(result).toEqual({ a2: 1, b2: [1, 2, 3] });
});
