import { filter } from "./filter";
import { juxt } from "./juxt";
import { length } from "./array";
import { pipe } from "./composition";
import { reduce } from "./reduce";

export const sum = reduce((a, b) => a + b, 0);
export const divide = (x) => (y) => y / x;
export const times = (x) => (y) => y * x;
export const average = (arr) => sum(arr) / arr.length;
export const multiply = (x) => (y) => x * y;

export const rate = (f) =>
  pipe(juxt(pipe(filter(f), length), length), ([x, y]) => x / y);
