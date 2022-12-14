import { head, join, tail } from "./array.js";

import { juxt } from "./juxt.js";
import { pipe } from "./composition.js";

export const truncate = (maxLength) => (input) =>
  input.length > maxLength ? `${input.substring(0, maxLength)}...` : input;

export const split = (x) => (s) => s.split(x);

export const uppercase = (s) => s.toLocaleUpperCase();
export const lowercase = (s) => s.toLocaleLowerCase();
export const replace = (target, replacement) => (s) =>
  s.replace(target, replacement);

export const capitalize = pipe(juxt(pipe(head, uppercase), tail), join(""));

export const trim = (characters) => (str) => {
  const charactersSet = new Set(characters);
  let start = 0;
  while (charactersSet.has(str[start])) {
    start += 1;
  }
  let end = str.length - 1;
  while (charactersSet.has(str[end])) {
    end -= 1;
  }
  return str.substr(start, end - start + 1);
};

export const testRegExp = (regexp) => (x) => regexp.test(x);

export const isValidRegExp = (str) => {
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const wrapString = (wrapping) => (inner) =>
  wrapping.replace("{}", inner);
