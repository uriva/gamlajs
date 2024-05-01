import {
  assert,
  assertEquals,
  assertNotEquals,
  assertRejects,
} from "std-assert";
import { length } from "./array.ts";
import { pipe } from "./composition.ts";
import { batch, hash, retry, timeout, timerCatcher } from "./io.ts";
import { mapCat } from "./map.ts";
import { repeat } from "./matrix.ts";
import { equals, prop } from "./operator.ts";
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
  const errorMessage = "error!";
  const f = batch(
    () => "key",
    1,
    () => Promise.reject(new Error(errorMessage)),
    pipe(length, equals(5)),
  );

  let hadError = false;
  try {
    await Promise.all([f(1), f(2), f(3), f(4), f(5)]);
  } catch (err) {
    hadError = true;
    assert(err.message.startsWith("error!"));
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
      () => Promise.resolve(success),
    )(),
    success,
  );
  await sleep(100); // Wait for the interval to finish.
});

Deno.test("timeout triggers if not ended in time", async () => {
  assertEquals(
    await timeout(
      10,
      async () => {
        await sleep(50);
        return success;
      },
    )().catch(() => failed),
    failed,
  );
  await sleep(100); // Wait for the interval to finish.
});

Deno.test("timeout can be caught", async () => {
  const [timer, catcher] = timerCatcher();
  const f = timer(10, async () => {
    await sleep(50);
    return success;
  });
  assertEquals(
    await catcher(f, () => Promise.resolve(failed))(),
    failed,
  );
  await sleep(100); // Wait for the interval to finish.
});

Deno.test("timeout catching is specifc", async () => {
  const failed2 = {};
  const [timer, catcher] = timerCatcher();
  const f = timer(10, async () => {
    await sleep(0);
    throw new Error("unrelated error");
  });
  assertEquals(
    await catcher(() => Promise.resolve(failed), f)().catch(() => failed2),
    failed2,
  );
  await sleep(100); // Wait for the interval to finish.
});

Deno.test("retry", async () => {
  let c = 0;
  const succeedOn3rdAttempt = async (x: number) => {
    await sleep(0);
    if (c < 2) {
      c++;
      throw new Error();
    }
    return x;
  };
  await retry(0, 2, succeedOn3rdAttempt)(23);
  c = 0;
  await assertRejects(async () => {
    await retry(0, 1, succeedOn3rdAttempt)(23);
  });
});

Deno.test("hash", () => {
  assertEquals(hash("hello", 10), hash("hello", 10));
  assertNotEquals(hash("hello there", 10), hash("hello", 10));
});
