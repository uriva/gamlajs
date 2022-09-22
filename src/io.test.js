import { equals, prop } from "./operator";
import { length, repeat } from "./array";

import { batch } from "./io";
import { mapCat } from "./map";
import { pipe } from "./composition";
import { sleep } from "./time";
import { wrapPromise } from "./promise";

const sumOfThings = (numbers) =>
  wrapPromise(numbers.reduce((acc, current) => acc + current, 0));

const batchedSum = batch(
  prop("id"),
  100,
  (tasks) =>
    repeat(pipe(mapCat(prop("numbers")), sumOfThings)(tasks), tasks.length),
  () => true,
);

test("batch", async () => {
  const [r1, r2] = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id1", numbers: [6, 6] }),
  ]);
  expect(r1).toEqual(10);
  expect(r2).toEqual(12);
});

test("batch key", async () => {
  expect(
    await Promise.all([
      batchedSum({ id: "id1", numbers: [5, 5] }),
      batchedSum({ id: "id2", numbers: [6, 6] }),
    ]),
  ).toEqual([10, 12]);
});

test("batch condition", async () => {
  let count = 0;
  const f = batch(
    () => "key",
    1,
    (x) => {
      count++;
      return wrapPromise(x);
    },
    pipe(length, equals(5)),
  );
  expect(await Promise.all([f(1), f(2), f(3), f(4), f(5)])).toEqual([
    1, 2, 3, 4, 5,
  ]);
  expect(count).toEqual(1);
});

test("batch with exceptions", async () => {
  const f = batch(
    () => "key",
    1,
    () => Promise.reject("error!"),
    pipe(length, equals(5)),
  );

  expect.assertions(1);

  try {
    await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  } catch (err) {
    expect(err).toEqual("error!");
  }
});

test("batch condition max wait time", async () => {
  let count = 0;
  const f = batch(
    () => "key",
    100,
    (args) => {
      count++;
      return Promise.resolve(args);
    },
    () => false,
  );

  f(1);
  await sleep(10);
  f(2);
  await sleep(10);
  f(3);
  const result = await f(4);
  expect.assertions(2);
  expect(result).toEqual(4);
  expect(count).toEqual(1);
});
