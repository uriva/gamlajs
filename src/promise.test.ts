import { isPromise } from "./promise.ts";

test("isPromise", () => {
  expect(isPromise({ then: "hello" })).toBeFalsy();
  expect(isPromise(new Promise(() => {}))).toBeTruthy();
});
