/**
 * Return a shallow copy of an object without the given key.
 * @example
 * removeKey('a')({ a: 1, b: 2 }) // { b: 2 }
 */
export const removeKey = <O>(key: keyof O) => (x: O): O => {
  const newObj = { ...x };
  delete newObj[key];
  return newObj;
};
