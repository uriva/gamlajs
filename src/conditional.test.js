import { ifElse, unless, when } from "./conditional";

import { wrapPromise } from "./promise";

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
