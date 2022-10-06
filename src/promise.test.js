import { isPromise } from "./promise.js";

test("isPromise", () => {
  expect(isPromise({ then: "hello" })).toBeFalsy();
  expect(isPromise(new Promise(() => {}))).toBeTruthy();
});
