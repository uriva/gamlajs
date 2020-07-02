import * as R from "ramda";

export const truncate = R.curry((maxLength, input) =>
  input.length > maxLength ? `${input.substring(0, maxLength)}...` : input
);

export const capitalize = R.pipe(R.juxt([R.pipe(R.head, R.toUpper), R.tail]), R.join(""));