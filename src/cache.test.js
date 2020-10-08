const { withCacheAsync } = require("./cache");

test("async cache", async () => {
  const foo = withCacheAsync((x) => x*x)
  expect(await foo(5)).toEqual(25);
});
