import {
  addEntry,
  applySpec,
  edgesToGraph,
  groupBy,
  keyFilter,
  keyMap,
  mapTerminals,
  sequentialMap,
  valFilter,
  valMap,
  wrapObject,
} from "./mapping.ts";

import { assertEquals } from "std-assert";
import { head } from "./array.ts";
import { wrapPromise } from "./promise.ts";
import { sleep } from "./time.ts";

Deno.test("keyFilter", () => {
  assertEquals(
    keyFilter((key: string) => key === "b")({ a: 1, b: [1, 2, 3] }),
    {
      b: [1, 2, 3],
    },
  );
});

([
  [{ a: 1, b: 3 }, { b: 3 }],
  [{}, {}],
] as [Record<string, number>, Record<string, number>][]).forEach((
  [obj, expected],
  i,
) =>
  Deno.test(`valFilter async with input ${i}`, async () => {
    assertEquals(
      await valFilter((x: number) => wrapPromise(x > 2))(obj),
      expected,
    );
  })
);

Deno.test("keyMap", () => {
  assertEquals(keyMap((key: string) => key + "2")({ a: 1, b: [1, 2, 3] }), {
    a2: 1,
    b2: [1, 2, 3],
  });
});

[
  [
    { a: 1, b: 3 },
    { a: 2, b: 4 },
  ],
  [{}, {}],
].forEach(([obj, expected]) =>
  Deno.test("valMap async with input %s", async () => {
    assertEquals(
      await valMap((x: number) => wrapPromise(x + 1))(obj),
      expected,
    );
  })
);

Deno.test("mapTerminals async", async () => {
  assertEquals(
    await mapTerminals((x: number) => wrapPromise(x + 1))({
      a: { a: 1, b: 2 },
      b: 3,
      c: [1, 2, 3],
    }),
    {
      a: { a: 2, b: 3 },
      b: 4,
      c: [2, 3, 4],
    },
  );
});

Deno.test("applySpec async", async () => {
  type Obj = { x: number; y: number };
  assertEquals(
    await applySpec({
      a: (obj: Obj) => wrapPromise(obj.x),
      b: { a: (obj: Obj) => wrapPromise(obj.y) },
    })({ x: 1, y: 2 }),
    { a: 1, b: { a: 2 } },
  );
});

Deno.test("groupBy", () => {
  assertEquals(groupBy<string, string>(head)(["cow", "cat", "dog"]), {
    c: ["cow", "cat"],
    d: ["dog"],
  });
});

Deno.test("wrapObject", () => {
  assertEquals(wrapObject("a")(1), { a: 1 });
});

Deno.test("addEntry", () => {
  assertEquals(addEntry("a", "b")({ c: "d" }), { a: "b", c: "d" });
});

Deno.test("edgesToGraph", () => {
  assertEquals(
    edgesToGraph([
      [1, 2],
      [1, 3],
      [4, 4],
      [2, 3],
    ]),
    { 1: new Set([2, 3]), 2: new Set([3]), 4: new Set([4]) },
  );
});

Deno.test("sequentialMap", async () => {
  const sequentialDoubler = sequentialMap(
    (x: number) => Promise.resolve(x * 2),
  );
  const result = await sequentialDoubler([1, 2, 3]);
  assertEquals(result, [2, 4, 6]);
});

Deno.test("sequentialMap processes items sequentially", async () => {
  const processOrder: number[] = [];
  const asyncTracker = async (x: number): Promise<number> => {
    processOrder.push(x);
    await sleep(1);
    return x * 2;
  };
  const sequentialTracker = sequentialMap(asyncTracker);
  await sequentialTracker([1, 2, 3]);
  assertEquals(processOrder, [1, 2, 3]);
});
