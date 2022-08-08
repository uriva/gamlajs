const { withCacheAsync } = require("./cache");

test("async cache", async () => {
  const foo = withCacheAsync(() => Math.random());
  const random = await foo(5);
  const cache = await foo(5);
  expect(random).toEqual(cache);
});

test("async cache parallel", async () => {
  const foo = withCacheAsync(
    () =>
      new Promise((resolve) => setTimeout(() => resolve(Math.random()), 1000))
  );
  const [random, cache] = await Promise.all([foo(5), foo(5)]);
  expect(random).toEqual(cache);
});
