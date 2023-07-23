import { pipe } from "./composition.ts";
import { prop } from "./operator.ts";
import { reduce } from "./reduce.ts";
import { wrapArray } from "./array.ts";

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
