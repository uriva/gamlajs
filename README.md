# Gamla

`gamla` is a functional programming library for Javascript/Typescript.

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
const histogram = pipe(
  split(""),
  filter(complement(anyjuxt(equals(" "), equals("'")))),
  // The function here is async.
  reduce((x, y) => Promise.resolve({ ...x, [y]: (x[y] || 0) + 1 }), () => ({})),
  sideEffect(console.log),
);

await histogram("let's see how many times each letter appears here");
```

## Use case: throttling and mapping

- you have a list of 1000 items
- you have an async function `process(item)`
- you need to process all items
- it needs to be done concurrently, but not more than 25 at a time

then you can just do

`map(throttle(25, process))(items)`