import {
  capitalize,
  isValidRegExp,
  split,
  testRegExp,
  trim,
  truncate,
  wrapString,
} from "./string.ts";

import { assertEquals } from "std-assert";

Deno.test("capitalize", () => {
  assertEquals(capitalize("test"), "Test");
});

Deno.test("start char", () => {
  assertEquals(trim(["-"])("-Test"), "Test");
});

Deno.test("start end", () => {
  assertEquals(trim(["."])("OK."), "OK");
});

Deno.test("both sides", () => {
  assertEquals(trim([".", "-"])("-OK."), "OK");
});

Deno.test("truncate", () => {
  assertEquals(truncate(3)("Test"), "Tes");
});

Deno.test("testRegExp", () => {
  assertEquals(testRegExp(/asd/)("asd"), true);
  assertEquals(testRegExp(/asd/)("ooo"), false);
});

Deno.test("isValidRegExp", () => {
  assertEquals(isValidRegExp("\bhello\b"), true);
  assertEquals(isValidRegExp("?"), false);
  assertEquals(isValidRegExp("a?"), true);
});

Deno.test("split", () => {
  assertEquals(split("\n")("hello\nthere"), ["hello", "there"]);
});

Deno.test("wrapString", () => {
  assertEquals(wrapString("hello {}")("world"), "hello world");
});
