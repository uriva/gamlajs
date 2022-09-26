import { between } from "./operator.js";

test("between", () => {
  expect(between([1, 2])(1)).toBeTruthy();
  expect(between([1, 2])(2)).toBeFalsy();
  expect(between([1, 4])(2.5)).toBeTruthy();
});
