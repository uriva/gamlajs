import { contains, includedIn, sort, zip } from "./array";

test("sort", () => {
  const x = [3, 2, 1];
  expect(sort(x)).toEqual([1, 2, 3]);
  expect(x).toEqual([3, 2, 1]);
});

test("sort strings", () => {
  const x = ["b", "bb", "a", "ab"];
  expect(sort(x)).toEqual(["a", "ab", "b", "bb"]);
});

test("zip", () => {
  expect(zip([1, 2, 3], [0, 0, 0])).toEqual([
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("includedIn", () => {
  expect.assertions(2);
  expect(includedIn([1, 2, 3])(1)).toBeTruthy();
  expect(includedIn([1, 2, 3])(4)).toBeFalsy();
});

test("contains", () => {
  expect.assertions(2);
  expect(contains(1)([1, 2, 3])).toBeTruthy();
  expect(contains(4)([1, 2, 3])).toBeFalsy();
});
