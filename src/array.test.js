import {
  all,
  any,
  anymap,
  contains,
  drop,
  includedIn,
  init,
  sort,
  take,
} from "./array.js";

test("init", () => {
  expect(init([3, 2, 1])).toEqual([3, 2]);
});

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

test("anymap", () => {
  expect(anymap((x) => x > 7)([(1, 2, 3)])).toBeFalsy();
  expect(anymap((x) => x > 2)([(1, 2, 3)])).toBeTruthy();
});

test("any", () => {
  expect(any([true, true, false])).toBeTruthy();
});

test("all", () => {
  expect(all([true, true, false])).toBeFalsy();
});

test("allmap", () => {
  expect(anymap((x) => x > 7)([(1, 2, 3)])).toBeFalsy();
  expect(anymap((x) => x > 0)([(1, 2, 3)])).toBeTruthy();
});

test("take", () => {
  expect(take(3)([1, 2, 3, 5])).toEqual([1, 2, 3]);
});

test("drop", () => {
  expect(drop(3)([1, 2, 3, 5])).toEqual([5]);
});
