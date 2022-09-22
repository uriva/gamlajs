const methodToFunction = (method) => (x) => (obj) => obj[method](x);

export const any = methodToFunction("some");
export const all = methodToFunction("all");
export const join = methodToFunction("join");

export const length = (array) => array.length;
export const unique = (key) => (array) => {
  const seen = new Set();
  const result = [];
  for (const x of array) {
    const k = key(x);
    if (!seen.has(k)) {
      result.push(x);
      seen.add(k);
    }
  }
  return result;
};

export const concat = (array) => {
  const result = [];
  for (const xs of array) {
    for (const x of xs) {
      result.push(x);
    }
  }
  return result;
};

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

export const range = (start, end) => {
  const result = [];
  for (let i = start; i < end; i++) result.push(i);
  return result;
};

export const contains = (x) => (array) => array.includes(x);
export const includedIn = (array) => (x) => array.includes(x);
