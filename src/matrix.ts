import { wrapArray } from "./array.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

/** Repeat an element N times into an array. @example repeat('a',3) // ['a','a','a'] */
export const repeat = <T>(element: T, times: number): T[] => {
  const result = [];
  for (let i = 0; i < times; i++) result.push(element);
  return result;
};

// deno-lint-ignore no-explicit-any
type GroupOfHomogeneousArrays<Types extends any[]> = {
  [K in keyof Types]: Types[K][];
};

type ProductOutput<Types> = { [K in keyof Types]: Types[K] }[];

/**
 * Cartesian product of arrays.
 * @example
 * product([[1,2],["a","b"]]) // [[1,'a'],[1,'b'],[2,'a'],[2,'b']]
 */
export const product = (reduce(
  (a, b) => a.flatMap((x: unknown[]) => b.map((y: unknown) => [...x, y])),
  () => [[]],
  // deno-lint-ignore no-explicit-any
)) as <Types extends any[]>(
  arrays: GroupOfHomogeneousArrays<Types>,
) => ProductOutput<Types>;

/**
 * Expand positions of an input tuple into a Cartesian product.
 * @example
 * explode<[number,string]>(1)([1,['a','b']]) // [[1,'a'],[1,'b']]
 */
export const explode = <OutputType extends unknown[]>(
  ...positions: number[]
): (xs: unknown[]) => ProductOutput<OutputType> =>
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
  ) as unknown as (xs: unknown[]) => ProductOutput<OutputType>;
