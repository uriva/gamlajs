import { asyncTimeit, timeit } from "./debug";

import { sleep } from "./time";

test("timeit", () => {
  const logSpy = jest.spyOn(console, "log");
  timeit(
    (time, args) => console.log(`took some time to run ${args[0]}^${args[1]}`),
    Math.pow,
  )(2, 1000);
  expect(logSpy).toHaveBeenCalledWith("took some time to run 2^1000");
});

test("asyncTimeit", async () => {
  const logSpy = jest.spyOn(console, "log");
  await asyncTimeit(
    (_, args) => console.log(`slept for ${args[0]}ms`),
    sleep,
  )(100);
  expect(logSpy).toHaveBeenCalledWith("slept for 100ms");

  const f = async ({ a, b, c }) => {
    await sleep(100);
    return a + b + c;
  };
  await asyncTimeit(
    (_1, _2, result) => console.log(`slept and returned ${result}`),
    f,
  )({ a: 1, b: 2, c: 3 });
  expect(logSpy).toHaveBeenCalledWith("slept and returned 6");
});