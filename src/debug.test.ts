// import { assert, asyncTimeit, timeit } from "./debug.ts";

// import { sleep } from "./time.ts";

// test("timeit", () => {
//   const logSpy = jest.spyOn(console, "log");
//   timeit(
//     (_, args) => console.log(`took some time to run ${args[0]}^${args[1]}`),
//     Math.pow,
//   )(2, 1000);
//   assertEquals(logSpy).toHaveBeenCalledWith("took some time to run 2^1000");
// });

// test("asyncTimeit", async () => {
//   const logSpy = jest.spyOn(console, "log");
//   await asyncTimeit(
//     (_, args) => console.log(`slept for ${args[0]}ms`),
//     sleep,
//   )(100);
//   assertEquals(logSpy).toHaveBeenCalledWith("slept for 100ms");

//   const f = async ({ a, b, c }: any) => {
//     await sleep(100);
//     return a + b + c;
//   };
//   await asyncTimeit(
//     (_1, _2, result) => console.log(`slept and returned ${result}`),
//     f,
//   )({ a: 1, b: 2, c: 3 });
//   assertEquals(logSpy).toHaveBeenCalledWith("slept and returned 6");
// });

// test("assert", () => {
//   const err = "not greater than 7";
//   assertEquals(() => {
//     assert((x) => x > 7, err)(3);
//   }).toThrow(err);
//   assert((x) => x > 7, err)(10);
// });
