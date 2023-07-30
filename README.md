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
// Keeps typing information.
const wordHistogram: (text: string) => Record<string, number> = pipe(
  split(""),
  filter(complement(anyjuxt(equals(" "), equals("'")))),
  // The function here is async.
  reduce((x, y) => Promise.resolve({ ...x, [y]: (x[y] || 0) + 1 }), () => 0),
  sideEffect(console.log),
);

assertEquals(
  await wordHistogram("let's see how many times each letter appears here"),
  {
    l: 2,
    e: 10,
    t: 4,
    s: 4,
    h: 3,
    o: 1,
    w: 1,
    m: 2,
    a: 4,
    n: 1,
    y: 1,
    i: 1,
    c: 1,
    r: 3,
    p: 2,
  },
);
```
