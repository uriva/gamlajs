const methodToFunction = (method) => (x) => (obj) => obj[method](x);

export const any = methodToFunction("some");
export const all = methodToFunction("all");
export const join = methodToFunction("join");

export const reverse = (array) => array.slice().reverse();
export const tail = (x) => x.slice(1);
export const head = (x) => x[0];
export const second = (x) => x[1];
export const empty = (x) => !x.length;
export const wrapArray = (x) => [x];

const isString = (x) => typeof x == "string";

export const sort = (x) =>
  x
    .slice()
    .sort((a, b) => (isString(a) && isString(b) ? a.localeCompare(b) : a - b));

// Zips arrays by the length of the first.
export const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));
