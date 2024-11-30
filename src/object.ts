export const removeKey = <O>(key: keyof O) => (x: O) => {
  const newObj = { ...x };
  delete newObj[key];
  return newObj;
};
