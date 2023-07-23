import { isPromise } from "./promise.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

export const map =
  <T, G>(f: (x: T) => G | Promise<G>) =>
  (xs: T[]): G[] | Promise<G[]> => {
    const results = [];
    for (const x of xs) {
      results.push(f(x));
    }
    return results.some(isPromise)
      ? (Promise.all(results) as Promise<G[]>)
      : (results as G[]);
  };
const concatReducer = <T>(a: T[], b: T[]) => a.concat(b);
export const mapCat = <T, G>(f: (x: T) => G[] | Promise<G[]>) =>
  pipe(
    map(f),
    reduce<G[], G[], typeof concatReducer>(concatReducer, () => []),
  );
