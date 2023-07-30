# Functional programming library for Javascript

## Installation

nodejs: `npm install gamla`

deno: `import { pipe } from "https://deno.land/x/gamla/src/index.ts";`

## Docs

This library allows you to write in typescript/javascript using composition.

It has two main advantages over similar libs:

1. It supports mixing async and sync functions
1. It keeps the type information, so you still get type safety when programming
   in pipelines.

A basic example:

```ts
const wordHistogram = pipe(
  split(""),
  filter(complement(anyjuxt(equals(" "), equals("'")))),
  // The function here is async.
  reduce((x, y) => Promise.resolve({ ...x, [y]: (x[y] || 0) + 1 }), () => ({})),
  sideEffect(console.log),
);

await wordHistogram("let's see how many times each letter appears here");
```
