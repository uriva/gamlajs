export const addDays = (millisTimestamp: number, days: number) => {
  const result = new Date(millisTimestamp);
  result.setDate(result.getDate() + days);
  return result;
};

export const lastNDays = (n: number) => [addDays(Date.now(), -n), Date.now()];

export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
