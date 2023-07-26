import { pipe } from "./composition.ts";
import { prop } from "./operator.ts";
import { reduce } from "./reduce.ts";
import { wrapArray } from "./array.ts";

export const repeat = <T>(element: T, times: number) => {
  const result = [];
  for (let i = 0; i < times; i++) result.push(element);
  return result;
};

export const product = reduce(
  (a, b) => a.flatMap((x: unknown[]) => b.map((y: unknown) => [...x, y])),
  () => [[]],
);

// deno-lint-ignore no-explicit-any
type ExplodeResult = { result: any; index: number };
export const explode = (...positions: number[]) =>
  pipe(
    reduce(
      ({ index, result }: ExplodeResult, current) => {
        result.push(positions.includes(index) ? current : wrapArray(current));
        return { index: index + 1, result };
      },
      () => ({ index: 0, result: [] }),
    ),
    prop<ExplodeResult>()("result"),
    product,
  );
