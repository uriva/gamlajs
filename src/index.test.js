const { asyncFirst, asyncPipe, asyncIdentity } = require("./index");
const { multiply } = require("ramda");

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
