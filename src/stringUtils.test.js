const { capitalize, trim, truncate } = require("./stringUtils");

test("test capitalize", () => {
  const result = capitalize("test");
  expect.assertions(1);
  expect(result).toBe("Test");
});

test("test trim", () => {
  const result = trim("-Test", ["-"]);

  expect.assertions(1);
  expect(result).toEqual("Test");
});

test("test truncate", () => {
  const result = truncate(3)("Test");

  expect.assertions(1);
  expect(result).toEqual("Tes...");
});
