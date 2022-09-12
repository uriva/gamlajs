import { capitalize, trim, truncate } from "./stringUtils";

test("test capitalize", () => {
  const result = capitalize("test");
  expect.assertions(1);
  expect(result).toBe("Test");
});

describe("test trim", () => {
  test("start char", () => {
    const result = trim(["-"])("-Test");

    expect.assertions(1);
    expect(result).toEqual("Test");
  });

  test("start end", () => {
    const result = trim(["."])("OK.");

    expect.assertions(1);
    expect(result).toEqual("OK");
  });
});

test("test truncate", () => {
  const result = truncate(3)("Test");

  expect.assertions(1);
  expect(result).toEqual("Tes...");
});
