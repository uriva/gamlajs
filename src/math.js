import { filter } from "./filter.js";
import { juxt } from "./juxt.js";
import { length } from "./array.ts";
import { pipe } from "./composition.js";
import { reduce } from "./reduce.js";

export const sum = reduce((a, b) => a + b, 0);
export const divide = (x) => (y) => y / x;
export const times = (x) => (y) => y * x;
export const average = (arr) => sum(arr) / arr.length;
export const multiply = (x) => (y) => x * y;

export const rate = (f) =>
  pipe(juxt(pipe(filter(f), length), length), ([x, y]) => x / y);
