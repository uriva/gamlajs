import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

type Async<T, G> = (_: T) => Promise<G>;
type Sync<T, G> = (_: T) => G;

type UnaryMaybeAsync<IsAsync, T, G> = IsAsync extends true ? Async<T, G>
  : Sync<T, G>;

export const map =
  <T, G, IsAsync extends boolean>(f: UnaryMaybeAsync<IsAsync, T, G>) =>
  (xs: T[]): IsAsync extends true ? Promise<G[]>
    : G[] => {
    const results = [];
    for (const x of xs) {
      results.push(f(x));
    }
    return (
      results.some((x) => x instanceof Promise) ? Promise.all(results) : results
    ) as IsAsync extends true ? Promise<G[]> : G[];
  };

export const mapCat = <T, G, IsAsync extends boolean>(
  f: UnaryMaybeAsync<IsAsync, T, G>,
) =>
  pipe(
    map<T, G, IsAsync>(f),
    reduce<G[], G[], false>(
      <T>(a: T[], b: T[]) => a.concat(b),
      () => [],
    ),
  );
