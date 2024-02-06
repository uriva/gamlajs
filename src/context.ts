import { AsyncLocalStorage } from "node:async_hooks";
import { Func } from "./typing.ts";

const localStorage = new AsyncLocalStorage();

export const withContext = <Context>(context: Context) =>
<F extends Func>(f: F): F =>
// @ts-expect-error cannot infer
(...xs) =>
  new Promise((resolve, reject) =>
    localStorage.run(
      { ...(localStorage.getStore() ?? {}), ...context },
      () => {
        f(...xs).then(resolve).catch(reject);
      },
    )
  );

export const getContextEntry = <Context>(defaultContext: Context) =>
<K extends keyof Context>(k: K): Context[K] =>
// @ts-expect-error not sure
(...xs) =>
  // @ts-expect-error not sure
  (localStorage.getStore()?.[k] ?? defaultContext[k])(...xs);
