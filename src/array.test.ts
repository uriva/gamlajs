import { assert, assertEquals } from "std-assert";

import {
  all,
  allmap,
  any,
  anymap,
  concat,
  contains,
  drop,
  enumerate,
  includedIn,
  init,
  slidingWindow,
  sort,
  sortCompare,
  sortKey,
  take,
  unique,
  uniqueBy,
  zip,
} from "./array.ts";

import { sample } from "./index.ts";

const _: number[] = concat([[1, 2, 3], [0, 0, 0]]);

Deno.test("concat", () => {
  assertEquals(concat([[1, 2, 3], [0, 0, 0]]), [
    1,
    2,
    3,
    0,
    0,
    0,
  ]);
});

Deno.test("zip", () => {
  assertEquals(zip([[1, 2, 3], [0, 0, 0]]), [
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

// @ts-expect-error zip typing check
const _zip: [string, string][] = zip<[string, number]>([["hello"], [
  1,
]]);

Deno.test("init", () => {
  assertEquals(init([3, 2, 1]), [3, 2]);
});

Deno.test("sort", () => {
  const x = [3, 2, 1];
  assertEquals(sort(x), [1, 2, 3]);
  assertEquals(x, [3, 2, 1]);
});

Deno.test("sort", () => {
  const x = [{ age: 2 }, { age: 12 }, { age: 1 }];
  assertEquals(sortCompare<{ age: number }>((x, y) => x.age > y.age)(x), [
    { age: 1 },
    { age: 2 },
    { age: 12 },
  ]);
});

Deno.test("sort strings", () => {
  assertEquals(sort(["b", "bb", "a", "ab"]), ["a", "ab", "b", "bb"]);
});

Deno.test("sortKey", () => {
  assertEquals(
    sortKey(({ a, b }: { a: number; b: number }) => [a, b])([
      { a: 1, b: 5 },
      { a: 1, b: 4 },
      { a: 0, b: 0 },
    ]),
    [
      { a: 0, b: 0 },
      { a: 1, b: 4 },
      { a: 1, b: 5 },
    ],
  );
});

Deno.test("sortKey 2", () => {
  assertEquals(
    sortKey(({ id, n }: { id: string; n: number }) => [id !== "123", -n])([
      { id: "123", n: 5 },
      { id: "", n: 9 },
      { id: "456", n: 8 },
    ]),
    [
      { id: "123", n: 5 },
      { id: "", n: 9 },
      { id: "456", n: 8 },
    ],
  );
});

Deno.test("includedIn", () => {
  assertEquals(includedIn([1, 2, 3])(1), true);
  assertEquals(includedIn([1, 2, 3])(4), false);
});

Deno.test("contains", () => {
  assertEquals(contains(1)([1, 2, 3]), true);
  assertEquals(contains(4)([1, 2, 3]), false);
});

Deno.test("anymap", () => {
  assertEquals(anymap((x: number) => x > 7)([1, 2, 3]), false);
  assertEquals(anymap((x: number) => x > 2)([1, 2, 3]), true);
});

Deno.test("anymap async", async () => {
  assertEquals(
    await anymap((x: number) => Promise.resolve(x > 7))([1, 2, 3]),
    false,
  );
  assertEquals(
    await anymap((x: number) => Promise.resolve(x > 2))([1, 2, 3]),
    true,
  );
});

Deno.test("any", () => {
  assertEquals(any([true, true, false]), true);
});

Deno.test("all", () => {
  assertEquals(all([true, true, false]), false);
});

Deno.test("allmap", () => {
  assertEquals(allmap((x: number) => x > 0)([1, 2, 3]), true);
  assertEquals(allmap((x: number) => x > 1)([1, 2, 3]), false);
});

Deno.test("allmap async", async () => {
  assertEquals(
    await allmap((x: number) => Promise.resolve(x > 0))([1, 2, 3]),
    true,
  );
  assertEquals(
    await allmap((x: number) => Promise.resolve(x > 1))([1, 2, 3]),
    false,
  );
});

Deno.test("take", () => {
  assertEquals(take(3)([1, 2, 3, 5]), [1, 2, 3]);
});

Deno.test("sample", () => {
  const elements = [1, 2, 3, 4];
  assertEquals(new Set(sample(5)(elements)), new Set([1, 2, 3, 4]));
  assert(elements.includes(sample<number>(1)(elements)[0]));
});

Deno.test("drop", () => {
  assertEquals(drop(3)([1, 2, 3, 5]), [5]);
});

Deno.test("enumerate", () => {
  assertEquals(enumerate([1, 2, 3, 5]), [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 5],
  ]);
});

Deno.test("slidingWindow", () => {
  assertEquals(slidingWindow(3)([1, 2, 3, 4]), [
    [1, 2, 3],
    [2, 3, 4],
  ]);
});

Deno.test("unique", () => {
  assertEquals(unique([1, 1, 2, 3, 4]), [1, 2, 3, 4]);
});

Deno.test("uniqueBy", () => {
  assertEquals(uniqueBy((x: number) => x % 2)([1, 1, 2, 3, 4]), [
    1,
    2,
  ]);
});
