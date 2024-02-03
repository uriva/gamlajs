import { assertEquals } from "std-assert";
import { getContextEntry, withContext } from "./context.ts";
import { sleep } from "./time.ts";

Deno.test("context works as expected", async () => {
  const c = { someFunction: () => 1 };
  const result = await withContext(c, async (): Promise<number> => {
    await sleep(0);
    return getContextEntry<typeof c>(
      { someFunction: () => 2 },
    )(
      "someFunction",
    )();
  })();
  assertEquals(result, 1);
});

Deno.test("nested context", async () => {
  const a = { someFunction: () => 1 };
  const b = { someOtherFunction: () => 3 };
  const nestedStuff = withContext(a, async (): Promise<number> => {
    await sleep(0);
    return getContextEntry<typeof a>(
      { someFunction: () => 2 },
    )(
      "someFunction",
    )() + getContextEntry<typeof b>(
      { someOtherFunction: () => 2 },
    )(
      "someOtherFunction",
    )();
  });
  const result = await withContext(b, nestedStuff)();
  assertEquals(result, 4);
});
