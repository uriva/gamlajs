export const not = (x) => !x;
export const prop = (key) => (x) => x[key];
export const equals = (x) => (y) => x === y;
export const greater = (x) => (y) => y > x;
export const smaller = (x) => (y) => y < x;
export const greaterEquals = (x) => (y) => y >= x;
export const smallerEquals = (x) => (y) => y <= x;
export const between =
  ([start, end]) =>
  (x) =>
    start <= x && x < end;
