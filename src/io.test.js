import {
  always,
  concat,
  equals,
  length,
  map,
  pipe,
  prop,
  reduce,
  repeat,
} from "ramda";
import { batch, singleToMultiple } from "./io";
import { sleep } from "./lock";

const sumOfThings = (numbers) =>
  Promise.resolve(
    numbers.reduce((acc, current) => acc + current),
    0
  );

const batchedSum = batch(
  prop("id"),
  100,
  singleToMultiple(
    pipe(map(prop("numbers")), reduce(concat, [])),
    (tasks, results) => repeat(results, tasks.length),
    sumOfThings
  ),
  always(true)
);

test("batch", async () => {
  const result = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id1", numbers: [6, 6] }),
  ]);

  expect.assertions(2);
  expect(result[0]).toEqual(10);
  expect(result[1]).toEqual(12);
});

test("batch key", async () => {
  const result = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id2", numbers: [6, 6] }),
  ]);

  expect.assertions(1);
  expect(result).toEqual([10, 12]);
});

test("batch condition", async (done) => {
  let count = 0;
  const f = batch(
    () => "key",
    1,
    (args) => {
      count++;
      return Promise.resolve(args);
    },
    pipe(length, equals(5))
  );

  const result = await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  expect.assertions(2);
  setTimeout(() => {
    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(count).toEqual(1);
    done();
  }, 100);
});

test("batch with exceptions", async () => {
  const f = batch(
    () => "key",
    1,
    () => Promise.reject("error!"),
    pipe(length, equals(5))
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
    always(false)
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
