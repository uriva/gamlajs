import { concat, head, juxt, last, map, pipe, reduce, repeat } from "ramda";
import { batch } from "./io";

const sumOfThings = (id, numbers) =>
  Promise.resolve(
    numbers.reduce((acc, current) => acc + current),
    0
  );

const batchedSum = batch(
  (id) => id,
  juxt([pipe(head, head), pipe(map(last), reduce(concat, []))]),
  (args, results) => repeat(results, args.length),
  sumOfThings
);

test("batch", async () => {
  const result = await Promise.all([
    batchedSum("id1", [5, 5]),
    batchedSum("id1", [6, 6]),
  ]);

  expect.assertions(2);
  expect(result[0]).toEqual(result[1]);
  expect(result[0]).toEqual(22);
});

test("batch key", async () => {
  const result = await Promise.all([
    batchedSum("id1", [5, 5]),
    batchedSum("id2", [6, 6]),
  ]);

  expect.assertions(1);
  expect(result).toEqual([10, 12]);
});
