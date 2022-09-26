import { sideEffect } from "./composition";

export const log = sideEffect(console.log);
export const logTable = sideEffect(console.table);
export const logWith = (...x) => sideEffect((y) => console.log(...x, y));

const getTimestampMilliseconds = () => new Date().getTime();

export const asyncTimeit =
  (handler, f) =>
  async (...args) => {
    const started = getTimestampMilliseconds();
    const result = await f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const timeit =
  (handler, f) =>
  (...args) => {
    const started = getTimestampMilliseconds();
    const result = f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };