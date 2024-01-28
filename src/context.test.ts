import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
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
