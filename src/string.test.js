import { capitalize, trim, truncate } from "./string";

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
