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
import { batch, executeConditionally, singleToMultiple } from "./io";

const sumOfThings = (numbers) =>
  Promise.resolve(
    numbers.reduce((acc, current) => acc + current),
    0
  );

const batchedSum = batch(
  prop("id"),
  100,
  executeConditionally(
    singleToMultiple(
      pipe(map(prop("numbers")), reduce(concat, [])),
      (tasks, results) => repeat(results, tasks.length),
      sumOfThings
    ),
    always(true)
  )
);

test("batch", async () => {
  const result = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id1", numbers: [6, 6] }),
  ]);

  expect.assertions(2);
  expect(result[0]).toEqual(result[1]);
  expect(result[0]).toEqual(22);
});

test("batch key", async () => {
  const result = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id2", numbers: [6, 6] }),
  ]);

  expect.assertions(1);
  expect(result).toEqual([10, 12]);
});

test("batch condition", async () => {
  let count = 0;
  const f = batch(
    () => "key",
    0,
    executeConditionally((args) => {
      count++;
      return Promise.resolve(args);
    }, pipe(length, equals(5)))
  );

  const result = await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  expect.assertions(2);
  expect(result).toEqual([1, 2, 3, 4, 5]);
  expect(count).toEqual(1);
});

test("batch with exceptions", async () => {
  const f = batch(
    () => "key",
    0,
    executeConditionally(
      () => Promise.reject("error!"),
      pipe(length, equals(5))
    )
  );

  expect.assertions(1);

  try {
    await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  } catch (err) {
    expect(err).toEqual("error!");
  }
});
