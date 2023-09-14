import { wrapArray } from "./array.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

export const repeat = <T>(element: T, times: number) => {
  const result = [];
  for (let i = 0; i < times; i++) result.push(element);
  return result;
};

// deno-lint-ignore no-explicit-any
type GroupOfHomogeneousArrays<Types extends any[]> = {
  [K in keyof Types]: Types[K][];
};

type ProductOutput<Types> = { [K in keyof Types]: Types[K] }[];

export const product = (reduce(
  (a, b) => a.flatMap((x: unknown[]) => b.map((y: unknown) => [...x, y])),
  () => [[]],
  // deno-lint-ignore no-explicit-any
)) as <Types extends any[]>(
  arrays: GroupOfHomogeneousArrays<Types>,
) => ProductOutput<Types>;

export const explode = <OutputType extends unknown[]>(...positions: number[]) =>
  pipe(
    reduce(
      ({ index, result }, current) => {
        result.push(positions.includes(index) ? current : wrapArray(current));
        return { index: index + 1, result };
      },
      () => ({ index: 0, result: [] }),
    ),
    ({ result }) => result as GroupOfHomogeneousArrays<OutputType>,
    product<OutputType>,
  );
