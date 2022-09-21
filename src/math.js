import { reduce } from "./reduce";

export const sum = reduce((a, b) => a + b, 0);
export const divide = (x) => (y) => y / x;
export const times = (x) => (y) => y * x;
export const average = (arr) => sum(arr) / arr.length;
export const multiply = (x) => (y) => x * y;
