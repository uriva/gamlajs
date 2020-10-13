const { withCacheAsync } = require("./cache");

test("async cache", async () => {
  const foo = withCacheAsync(() => Math.random());
  const random = await foo(5);
  const cache = await foo(5);
  expect(random).toEqual(cache);
});
