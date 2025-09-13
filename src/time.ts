/**
 * Add a number of days to a millisecond timestamp.
 * @example
 * addDays(Date.parse('2024-01-01'), 1) // -> Jan 2, 2024
 */
export const addDays = (millisTimestamp: number, days: number): Date => {
  const result = new Date(millisTimestamp);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get [Date n days ago, nowMillis].
 * @example
 * lastNDays(7)
 */
export const lastNDays = (n: number): [Date, number] => [
  addDays(Date.now(), -n),
  Date.now(),
];

/** Sleep for N milliseconds. */
export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
