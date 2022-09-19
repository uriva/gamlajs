import { sort } from "./array";

test("sort", () => {
  const x = [3, 2, 1];
  expect(sort(x)).toEqual([1, 2, 3]);
  expect(x).toEqual([3, 2, 1]);
});

test("sort strings", () => {
  const x = ["b", "bb", "a", "ab"];
  expect(sort(x)).toEqual(["a", "ab", "b", "bb"]);
});
