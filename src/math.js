import { sum } from "ramda";

export const divide = (x) => (y) => y / x;
export const times = (x) => (y) => y * x;
export const average = (arr) => sum(arr) / arr.length;
export const multiply = (x) => (y) => x * y;
