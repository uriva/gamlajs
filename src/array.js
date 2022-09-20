export const any = (f) => (arr) => arr.some(f);
export const all = (f) => (arr) => arr.every(f);
export const reverse = (array) => array.slice().reverse();
export const tail = (x) => x.slice(1);
export const head = (x) => x[0];
export const empty = (x) => !x.length;
export const join = (x) => (array) => array.join(x);
export const wrapArray = (x) => [x];

const isString = (x) => typeof x == "string";

export const sort = (x) =>
  x
    .slice()
    .sort((a, b) => (isString(a) && isString(b) ? a.localeCompare(b) : a - b));
