import { AsyncLocalStorage } from "node:async_hooks";
import { letIn } from "./operator.ts";
import { Func } from "./typing.ts";

const withContext = <T>(storage: AsyncLocalStorage<T>, context: T) =>
<F extends Func>(f: F): F =>
// @ts-expect-error cannot infer
(...xs) =>
  new Promise((resolve, reject) =>
    storage.run(context, () => {
      f(...xs).then(resolve).catch(reject);
    })
  );

export const context = <F extends Func>(fallbackFn: F) =>
  letIn(new AsyncLocalStorage<F>(), (storage) => ({
    inject: (fn: F) => withContext(storage, fn),
    // Cannot be made point free because has to call `storage.getStore` contextually.
    access: ((...xs: Parameters<F>) =>
      (storage.getStore() ?? fallbackFn)(...xs)) as F,
  }));
