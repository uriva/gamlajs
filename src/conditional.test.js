import { ifElse, unless, when } from "./conditional.js";

import { wrapPromise } from "./promise.js";

test("ifElse async", async () => {
  const testFunction = ifElse(
    (x) => wrapPromise(x === 2),
    () => true,
    () => false,
  );
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(false);
});

test("unless async", async () => {
  const testFunction = unless(
    (x) => wrapPromise(x === 2),
    () => true,
  );
  expect(await testFunction(2)).toStrictEqual(2);
  expect(await testFunction(3)).toStrictEqual(true);
});

test("when async", async () => {
  const testFunction = when(
    (x) => wrapPromise(x === 2),
    () => true,
  );
  expect(await testFunction(2)).toStrictEqual(true);
  expect(await testFunction(3)).toStrictEqual(3);
});
