import { assertEquals } from "@std/assert";
import { pipe } from "./composition.ts";
import { alljuxt, anyjuxt, juxt, juxtCat, pairRight } from "./juxt.ts";
import { map } from "./map.ts";
import { multiply } from "./math.ts";
import { not } from "./operator.ts";
import { wrapPromise } from "./promise.ts";

Deno.test("async juxt", async () => {
  assertEquals(
    await juxt(wrapPromise, pipe(map(multiply(2)), wrapPromise))([2]),
    [[2], [4]],
  );
});

Deno.test("async pairRight", async () => {
  assertEquals(
    await pairRight(wrapPromise<number>)(2),
    [2, 2],
  );
});

(async () => {
  // @ts-expect-error should identify type correctly
  const _1: string = await pairRight(wrapPromise<number>)(2);
  const _2: [number, number] = await pairRight(wrapPromise<number>)(2);
})();

Deno.test("juxt non unary", () => {
  assertEquals(
    juxt(
      (x: number, y: number) => x - y,
      (x: number, y: number) => x + y,
    )(3, 2),
    [1, 5],
  );
});

Deno.test("juxtCat", async () => {
  assertEquals(
    await juxtCat(
      (x: number) => wrapPromise([x, x + 1]),
      (x: number) => wrapPromise([x + 2, x + 3]),
    )(1),
    [1, 2, 3, 4],
  );
});

Deno.test("async pairRight", async () => {
  assertEquals(
    await pairRight((x: number) => wrapPromise(x * 2))(5),
    [5, 10],
  );
});

Deno.test("anyjuxt", () => {
  assertEquals(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
    true,
  );
  assertEquals(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(0),
    false,
  );
});

Deno.test("alljuxt", () => {
  assertEquals(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(10),
    true,
  );
  assertEquals(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
    false,
  );
});

// Check `anyjuxt` reports typing correctly.
pipe(
  anyjuxt(
    (x: number) => x > 7,
    (x: number) => x > 1,
  ),
  not,
);

// Check `alljuxt` reports typing correctly.
pipe(
  alljuxt(
    (x: number) => x > 7,
    (x: number) => Promise.resolve(x > 1),
  ),
  not,
);

const _ = async () => {
  // @ts-expect-error `juxtCat` reports typing correctly.
  const _1: string[] = juxtCat(
    (x: number) => [x, x],
    (_: number) => ["a", "b"],
    (x: number) => [x, x],
  )(1);
  const _2: (string | number)[] = juxtCat(
    (_: number) => ["a", "b"],
    (x: number) => [x, x],
  )(1);
  // @ts-expect-error `juxtCat` detects async.
  const _3: (string | number)[] = juxtCat(
    (_: number) => Promise.resolve(["a", "b"]),
    (x: number) => [x, x],
  )(1);
  const _4: (string | number)[] = await juxtCat(
    (_: number) => Promise.resolve(["a", "b"]),
    (x: number) => [x, x],
  )(1);
  const _5 = juxtCat(
    // @ts-expect-error - incompatible: first takes number, second takes string
    (x: number) => [x],
    (x: string) => [x],
  );
  const _6 = juxtCat(
    (x: { a: number; b: number }) => [x],
    (x: { a: number }) => [x],
  );
  const _7 = juxtCat(
    // @ts-expect-error - incompatible: first takes number, second takes string
    (x: { a: number; b: number }) => [x],
    (x: { a: string }) => [x],
  );
};
