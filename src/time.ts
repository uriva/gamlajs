export const addDays = (millisTimestamp: number, days: number): Date => {
  const result = new Date(millisTimestamp);
  result.setDate(result.getDate() + days);
  return result;
};

export const lastNDays = (n: number): [Date, number] => [
  addDays(Date.now(), -n),
  Date.now(),
];

export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
