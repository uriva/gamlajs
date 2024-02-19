import { assertEquals } from "std-assert";
import { context } from "./context.ts";

Deno.test("inject and access", async () => {
  const { inject, access } = context((): string => "nothing injected");
  const withString = inject(() => "injected");
  const f = () => Promise.resolve(access());
  assertEquals(await withString(f)(), "injected");
  assertEquals(await f(), "nothing injected");
});

Deno.test("override", async () => {
  const { inject, access } = context((): string => "nothing injected");
  const withStringX = inject(() => "X");
  const withStringY = inject(() => "Y");
  const f = () => Promise.resolve(access());
  assertEquals(await withStringX(f)(), "X");
  assertEquals(await withStringY(withStringX(f))(), "X");
  assertEquals(await withStringX(withStringY(f))(), "Y");
  assertEquals(await f(), "nothing injected");
});
