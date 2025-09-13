/**
 * Cut a string to a maximum length.
 * @example
 * truncate(3)('abcdef') // 'abc'
 */
export const truncate = (maxLength: number) => (input: string): string =>
  input.length > maxLength ? input.substring(0, maxLength) : input;

/**
 * Split a string by a separator.
 * @example
 * split(',')('a,b,c') // ['a','b','c']
 */
export const split = (x: string | RegExp) => (s: string): string[] =>
  s.split(x);

/** Uppercase a string. @example uppercase('hi') // 'HI' */
export const uppercase = (s: string): string => s.toLocaleUpperCase();
/** Lowercase a string. @example lowercase('HI') // 'hi' */
export const lowercase = (s: string): string => s.toLocaleLowerCase();
/**
 * Replace occurrences in a string.
 * @example
 * replace('a','x')('banana') // 'bxnxnx'
 */
export const replace =
  (target: string | RegExp, replacement: string) => (s: string): string =>
    s.replace(target, replacement);

/** Capitalize first character. @example capitalize('hello') // 'Hello' */
export const capitalize = (s: string): string =>
  s[0].toLocaleUpperCase() + s.slice(1);

/** Trim surrounding whitespace. @example trimWhitespace('  hi  ') // 'hi' */
export const trimWhitespace = (x: string): string => x.trim();

/**
 * Trim specific characters from both ends.
 * @example
 * trim(['/'])('/path/') // 'path'
 */
export const trim = (characters: string[]) => (str: string): string => {
  const charactersSet = new Set(characters);
  let start = 0;
  while (charactersSet.has(str[start])) {
    start += 1;
  }
  let end = str.length - 1;
  while (charactersSet.has(str[end])) {
    end -= 1;
  }
  return str.substring(start, end + 1);
};

/** Test a regular expression against a string. */
export const testRegExp = (regexp: RegExp) => (x: string): boolean =>
  regexp.test(x);

/** Check if a string is a valid RegExp pattern. */
export const isValidRegExp = (str: string): boolean => {
  try {
    new RegExp(str);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Substitute '{}' in a wrapping template with the inner string.
 * @example
 * wrapString('<{}>')('x') // '<x>'
 */
export const wrapString = (wrapping: string) => (inner: string): string =>
  wrapping.replace("{}", inner);
