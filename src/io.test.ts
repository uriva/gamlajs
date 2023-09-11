import { batch, timeout } from "./io.ts";
import { equals, prop } from "./operator.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { length } from "./array.ts";
import { pipe } from "./composition.ts";
import { mapCat } from "./map.ts";
import { repeat } from "./matrix.ts";
import { wrapPromise } from "./promise.ts";
import { sleep } from "./time.ts";

const sumOfThings = (numbers: number[]) =>
  wrapPromise(numbers.reduce((acc, current) => acc + current, 0));

type MyTask = { id: string; numbers: number[] };
const executor = async (tasks: MyTask[]) => (repeat(
  await pipe(mapCat(prop<MyTask>()("numbers")), sumOfThings)(tasks),
  tasks.length,
));

const batchedSum = batch<string, MyTask, number[]>(
  prop<MyTask>()("id"),
  100,
  executor,
  () => true,
);

Deno.test("batch", async () => {
  const [r1, r2] = await Promise.all([
    batchedSum({ id: "id1", numbers: [5, 5] }),
    batchedSum({ id: "id1", numbers: [6, 6] }),
  ]);
  assertEquals(r1, 10);
  assertEquals(r2, 12);
});

Deno.test("batch key", async () => {
  assertEquals(
    await Promise.all([
      batchedSum({ id: "id1", numbers: [5, 5] }),
      batchedSum({ id: "id2", numbers: [6, 6] }),
    ]),
    [10, 12],
  );
});

Deno.test("batch condition", async () => {
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
  assertEquals(
    await Promise.all([f(1), f(2), f(3), f(4), f(5)]),
    [1, 2, 3, 4, 5],
  );
  assertEquals(count, 1);
});

Deno.test("batch with exceptions", async () => {
  const f = batch(
    () => "key",
    1,
    () => Promise.reject("error!"),
    pipe(length, equals(5)),
  );

  let hadError = false;
  try {
    await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  } catch (err) {
    hadError = true;
    assertEquals(err, "error!");
  }
  assertEquals(hadError, true);
});

Deno.test("batch condition max wait time", async () => {
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
  assertEquals(result, 4);
  assertEquals(count, 1);
});

const failed = "failed";
const success = "success";
Deno.test("timeout doesn't trigger if ended in time", async () => {
  assertEquals(
    await timeout(
      10,
      () => failed,
      () =>
        new Promise((resolve) => {
          resolve(success);
        }),
    )(),
    success,
  );
  await sleep(100); // Wait for the interval to finish.
});

Deno.test("timeout triggers if not ended in time", async () => {
  assertEquals(
    await timeout(
      10,
      () => failed,
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve(success), 50);
        }),
    )(),
    failed,
  );
  await sleep(100); // Wait for the interval to finish.
});
