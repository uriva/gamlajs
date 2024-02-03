import { AsyncLocalStorage } from "node:async_hooks";
import { Func } from "./typing.ts";

const localStorage = new AsyncLocalStorage();

const getContext = <Context>(defaultContext: Context): Context =>
  (localStorage.getStore() as Context | undefined) ?? defaultContext;

export const withContext =
  <Context, F extends Func>(context: Context, y: F) => (...xs: Parameters<F>) =>
    new Promise((resolve) =>
      localStorage.run({ ...getContext(context), ...context }, () => {
        y(...xs).then(resolve);
      })
    );

export const getContextEntry = <Context>(defaultContext: Context) =>
<K extends keyof Context>(k: K): Context[K] =>
// @ts-expect-error not sure
(...xs) =>
  // @ts-expect-error not sure
  getContext(defaultContext)[k](...xs);
