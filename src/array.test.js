import { contains, includedIn, sort } from "./array";

test("sort", () => {
  const x = [3, 2, 1];
  expect(sort(x)).toEqual([1, 2, 3]);
  expect(x).toEqual([3, 2, 1]);
});

test("sort strings", () => {
  const x = ["b", "bb", "a", "ab"];
  expect(sort(x)).toEqual(["a", "ab", "b", "bb"]);
});

test("includedIn", () => {
  expect(includedIn([1, 2, 3])(1)).toBeTruthy();
  expect(includedIn([1, 2, 3])(4)).toBeFalsy();
});

test("contains", () => {
  expect(contains(1)([1, 2, 3])).toBeTruthy();
  expect(contains(4)([1, 2, 3])).toBeFalsy();
});
