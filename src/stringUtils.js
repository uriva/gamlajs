import * as R from "ramda";

export const truncate = R.curry((maxLength, input) =>
  input.length > maxLength ? `${input.substring(0, maxLength)}...` : input
);

export const capitalize = R.pipe(
  R.juxt([R.pipe(R.head, R.toUpper), R.tail]),
  R.join("")
);

export const trim = (str, characters) => {
  let start = 0;
  while (characters.indexOf(str[start]) >= 0) {
    start += 1;
  }
  let end = str.length - 1;
  while (characters.indexOf(str[end]) >= 0) {
    end -= 1;
  }
  return str.substr(start, end - start + 1);
};
