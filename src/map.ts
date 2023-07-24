import { Unary } from "./typing.ts";
import { pipe } from "./composition.ts";
import { reduce } from "./reduce.ts";

export const map =
  <Input, Output>(f: Unary<Input, Output>) =>
  (xs: Input[]): Output extends Promise<unknown> ? Promise<Awaited<Output>[]>
    : Output[] => {
    const results = [];
    for (const x of xs) {
      results.push(f(x));
    }
    // @ts-ignore reason: too complex
    return (results.some((x) => x instanceof Promise)
      ? Promise.all(results)
      : results);
  };

export const mapCat = <T, G>(
  f: Unary<T, G>,
) =>
(x: T[]): G =>
  // @ts-ignore reason: too complex
  pipe(
    map(f),
    // @ts-ignore reason: too complex
    reduce((a, b) => a.concat(b), () => []),
  )(x);
