import {
  capitalize,
  isValidRegExp,
  split,
  testRegExp,
  trim,
  truncate,
  wrapString,
} from "./string.js";

test("capitalize", () => {
  expect(capitalize("test")).toBe("Test");
});

describe("test trim", () => {
  test("start char", () => {
    expect(trim(["-"])("-Test")).toEqual("Test");
  });

  test("start end", () => {
    expect(trim(["."])("OK.")).toEqual("OK");
  });
});

test("truncate", () => {
  expect(truncate(3)("Test")).toEqual("Tes...");
});

test("testRegExp", () => {
  expect(testRegExp(/asd/)("asd")).toBeTruthy();
  expect(testRegExp(/asd/)("ooo")).toBeFalsy();
});

test("isValidRegExp", () => {
  expect(isValidRegExp("\bhello\b")).toBeTruthy();
  expect(isValidRegExp("?")).toBeFalsy();
  expect(isValidRegExp("a?")).toBeTruthy();
});

test("split", () => {
  expect(split("\n")("hello\nthere")).toEqual(["hello", "there"]);
});

test("wrapString", () => {
  expect(wrapString("hello {}")("world")).toEqual("hello world");
});
