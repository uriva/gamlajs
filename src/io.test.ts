import { batch, timeout } from "./io.ts";
import { equals, prop } from "./operator.ts";

import { length } from "./array.ts";
import { mapCat } from "./map.ts";
import { pipe } from "./composition.ts";
import { repeat } from "./matrix.ts";
import { sleep } from "./time.ts";
import { wrapPromise } from "./promise.ts";

const sumOfThings = (numbers: number[]) =>
  wrapPromise(numbers.reduce((acc, current) => acc + current, 0));

type MyTask = { id: string; numbers: number[] };
const batchedSum = batch<string, MyTask>(
  prop<MyTask, "id">("id"),
  100,
  (tasks: MyTask[]) =>
    repeat(
      pipe(mapCat(prop<MyTask, "numbers">("numbers")), sumOfThings)(tasks),
      tasks.length,
    ),
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
    (x: number[]) => {
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
    (x: number[]) => {
      count++;
      return Promise.resolve(x);
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

test("timeout doesn't trigger if ended in time", async () => {
  const failed = "failed";
  const success = "success";
  expect(
    await timeout(
      500,
      () => failed,
      () =>
        new Promise((resolve) => {
          resolve(success);
        }),
    )(),
  ).toEqual(success);
});

test("timeout triggers if not ended in time", async () => {
  const failed = "failed";
  expect(
    await timeout(
      10,
      () => failed,
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve("success"), 300);
        }),
    )(),
  ).toEqual(failed);
});
