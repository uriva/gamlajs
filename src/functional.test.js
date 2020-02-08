const {
  asyncFirst,
  asyncPipe,
  asyncIdentity,
  asyncJuxt,
  asyncMap
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
