export const truncate = (maxLength: number) => (input: string) =>
  input.length > maxLength ? `${input.substring(0, maxLength)}...` : input;

export const split = (x: string | RegExp) => (s: string) => s.split(x);

export const uppercase = (s: string) => s.toLocaleUpperCase();
export const lowercase = (s: string) => s.toLocaleLowerCase();
export const replace =
  (target: string | RegExp, replacement: string) => (s: string) =>
    s.replace(target, replacement);

export const capitalize = (s: string) => s[0].toLocaleUpperCase() + s.slice(1);

export const trimWhitespace = (x: string) => x.trim();

export const trim = (characters: string[]) => (str: string) => {
  const charactersSet = new Set(characters);
  let start = 0;
  while (charactersSet.has(str[start])) {
    start += 1;
  }
  let end = str.length - 1;
  while (charactersSet.has(str[end])) {
    end -= 1;
  }
  return str.substr(start, end - start + 1);
};

export const testRegExp = (regexp: RegExp) => (x: string) => regexp.test(x);

export const isValidRegExp = (str: string) => {
  try {
    new RegExp(str);
    return true;
  } catch (_) {
    return false;
  }
};

export const wrapString = (wrapping: string) => (inner: string) =>
  wrapping.replace("{}", inner);
