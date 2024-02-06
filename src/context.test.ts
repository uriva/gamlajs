import { assertEquals } from "std-assert";
import { context, getContextEntry, withContext } from "./context.ts";
import { sleep } from "./time.ts";

Deno.test("context works as expected", async () => {
  const c = { someFunction: () => 1 };
  const result = await withContext(c)(async (): Promise<number> => {
    await sleep(0);
    return getContextEntry<typeof c>({ someFunction: () => 2 })(
      "someFunction",
    )();
  })();
  assertEquals(result, 1);
});

Deno.test("new api for context works as expected", async () => {
  const { inject, access } = context(() => 1, () => 2);
  const f = () => Promise.resolve(access());
  assertEquals(await inject(f)(), 1);
  assertEquals(await f(), 2);
});

Deno.test("nested context", async () => {
  const a = { someFunction: () => 1 };
  const b = { someOtherFunction: () => 3 };
  const nestedStuff = withContext(a)(async () => {
    await sleep(0);
    return getContextEntry<typeof a>({ someFunction: () => 2 })(
      "someFunction",
    )() + getContextEntry<typeof b>({
      someOtherFunction: () => 2,
    })("someOtherFunction")();
  });
  const result = await withContext(b)(nestedStuff)();
  assertEquals(result, 4);
});

Deno.test("partial implementation", async () => {
  const get = getContextEntry({ a: () => 2, b: () => 3 });
  const override = { a: () => 1 };
  const f = withContext(override)(async (): Promise<[number, number]> => {
    await sleep(0);
    return [get("a")(), get("b")()];
  });
  // Check typing as well
  const result: [number, number] = await f();
  assertEquals(result, [1, 3]);
});
