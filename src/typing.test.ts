import type { CompatibleInputs } from "./typing.ts";

// Enforces parameter compatibility - incompatible types
const _1: CompatibleInputs<
  [(x: number) => number, (x: string) => string],
  [x: number]
> = [
  (x: number) => x,
  // @ts-expect-error - incompatible: first takes number, second takes string
  (x: string) => x,
];

// Allows compatible structural types
const _2: CompatibleInputs<
  [(_x: { a: number; b: number }) => void, (_x: { a: number }) => void],
  [x: { a: number; b: number }]
> = [
  (_x: { a: number; b: number }) => {},
  (_x: { a: number }) => {},
];

// Catches structural type incompatibility
const _3: CompatibleInputs<
  [(_x: { a: number; b: number }) => void, (_x: { a: string }) => void],
  [x: { a: number; b: number }]
> = [
  (_x: { a: number; b: number }) => {},
  // @ts-expect-error - incompatible: 'a' is number in first, string in second
  (_x: { a: string }) => {},
];

// Enforces all functions accept the same args
const _4: CompatibleInputs<
  [(x: number, y: number) => number, (a: number, b: number) => number],
  [x: number, y: number]
> = [
  (x: number, y: number) => x + y,
  (a: number, b: number) => a * b,
];
