import { pipe } from "./composition";
import { prop } from "./operator";
import { reduce } from "./reduce";
import { wrapArray } from "./array";

// Zips arrays by the length of the first.
export const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));

export const repeat = (element, times) => {
  const result = [];
  for (let i = 0; i < times; i++) result.push(element);
  return result;
};

export const product = reduce(
  (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
  () => [[]],
);

export const explode = (...positions) =>
  pipe(
    reduce(
      ({ index, result }, current) => {
        result.push(positions.includes(index) ? current : wrapArray(current));
        return { index: index + 1, result };
      },
      () => ({ index: 0, result: [] }),
    ),
    prop("result"),
    product,
  );
