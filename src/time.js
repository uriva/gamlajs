export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const lastNDays = (n) => [addDays(Date.now(), -n), Date.now()];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
