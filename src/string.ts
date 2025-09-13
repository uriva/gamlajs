export const truncate = (maxLength: number) => (input: string): string =>
  input.length > maxLength ? input.substring(0, maxLength) : input;

export const split = (x: string | RegExp) => (s: string): string[] =>
  s.split(x);

export const uppercase = (s: string): string => s.toLocaleUpperCase();
export const lowercase = (s: string): string => s.toLocaleLowerCase();
export const replace =
  (target: string | RegExp, replacement: string) => (s: string): string =>
    s.replace(target, replacement);

export const capitalize = (s: string): string =>
  s[0].toLocaleUpperCase() + s.slice(1);

export const trimWhitespace = (x: string): string => x.trim();

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

export const testRegExp = (regexp: RegExp) => (x: string): boolean =>
  regexp.test(x);

export const isValidRegExp = (str: string): boolean => {
  try {
    new RegExp(str);
    return true;
  } catch (_) {
    return false;
  }
};

export const wrapString = (wrapping: string) => (inner: string): string =>
  wrapping.replace("{}", inner);
