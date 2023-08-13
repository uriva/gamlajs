# Gamla

![Buckets to pipelines](https://www.ku.ac.ae/wp-content/uploads/2019/11/Oil-and-gas-pipelines-running-through-the-desert_resized.jpg)

`gamla` is a functional programming library for Javascript/Typescript.

## Installation

nodejs: `npm install gamla`

deno: `import { pipe } from "https://deno.land/x/gamla/src/index.ts";`

## Intro

This library allows you to write in typescript/javascript using composition.

It has two main advantages over similar libs:

1. It supports mixing async and sync functions
1. As oppposed to `ramda` and other libraries it keeps typing information, so
   you get type safety when programming in pipelines.

## Use cases

### Basic Example

```ts
type Person = { name: string; age: number };

const people: Person[] = [
  { name: "alice", age: 28 },
  { name: "bob", age: 22 },
  { name: "carroll", age: 76 },
];

const getNamesOfPeopleOlderThan25 = pipe(
  filter(({ age }) => age > 25),
  sideEffect(console.log), // Log mid pipeline.
  map(({ name }) => name), // Get people names only.
  join(", "),
);

console.log(getNamesOfPeopleOlderThan25(people)); // "alice, carroll"
```

### Async programming

Let's imagine you want to call a remote server for some information. Usually
this means refactoring your entire program to async functions. Writing in
pipelines let's you change whatever you want with no collateral refactoring
needed.

```ts
// Call some remote server to get hobbies for a person.
const getHobbies = async (person: Person): string[] => {...} 

const isAnyoneUnder25InterestedInGolfing = pipe(
  filter(({ age }: Person) => age < 25),
  // Async function mid pipeline, even tho functions before and after are not.
  // Also flatten the result.
  mapCat(getHobbies),
  includes('golfing'),
);

console.log(await isAnyoneUnder25InterestedInGolfing(people)); // probably `false` :)
```

### IO and multithreading

`gamla` also has a bunch of methods to facilitate parallel IO operations.
Consider the following case:

- you have a list of 1000 items
- you have an async function `process(item)`
- you need to process all items
- it needs to be done concurrently, but not more than 25 at a time

This seemingly complex list of requirements is a simple readable one liner:

```ts
map(throttle(25, process))(items);
```

### Type safety

`gamla` preserves typing, so if you by accident you write something like this:

```ts
const typingMismatch = pipe(
  filter(({ age }: Person) => age < 25),
  (x: number) => x + 1, // The result of `filter` here is an array of `Person`, not a number!
);
```

You will get a typing error.

## Complete API

### anymap

```typescript
anymap<X>(f: (x: X) => boolean): (xs: X[]) => boolean
```

The `anymap` function takes a predicate function `f` and returns a new function
that takes an array `xs` and checks if any element in the array satisfies the
predicate `f`. It returns a boolean value indicating the result.

#### Example

```typescript
const numbers = [1, 2, 3, 4, 5];
const isEven = (x: number) => x % 2 === 0;

const anyEven = anymap(isEven);
const result = anyEven(numbers); // checks if any number in the array is even

console.log(result); // Output: true
```

In the example above, the `anymap` function is used to create a new function
`anyEven` that checks if any number in an array is even. The result is `true`
because there is at least one even number in the array `[1, 2, 3, 4, 5]`.

### allmap

`(f: (x: X) => boolean) => (xs: X[]) => xs.every(f)`

This function takes a predicate function `f` and returns a new function that
takes an array `xs` and returns `true` if `f` returns `true` for every element
in `xs`, or `false` otherwise.

#### Parameters:

- `f: (x: X) => boolean` - A predicate function that takes an element `x` of
  type `X` and returns a boolean value. It determines the condition to be
  checked for each element in the input array.

#### Returns:

- `(xs: X[]) => boolean` - A function that takes an array `xs` of type `X` and
  returns `true` if `f` returns `true` for every element in `xs`, or `false`
  otherwise.

#### Example

```typescript
const isEven = (x: number) => x % 2 === 0;

const allNumbersEven = allmap(isEven);
const result = allNumbersEven([2, 4, 6, 8]);

console.log(result); // Output: true
```

In the above example, the `allNumbersEven` function is created by passing the
`isEven` function to `allmap`. It checks if every element in the input array
`[2, 4, 6, 8]` is even using the `isEven` function. The resulting value is
`true`, as all numbers in the array are even.

### `join`

Signature: `(str: string) => (x: (string | number)[]) => string`

This function takes a `string` parameter `str` as its first argument and returns
a new function. The returned function takes an array `x` of `string` or `number`
elements and joins them into a single string using the specified separator
`str`.

Example

```javascript
const numbers = [1, 2, 3, 4, 5];
const joinWithComma = join(",");
console.log(joinWithComma(numbers));
```

Output:

```
"1,2,3,4,5"
```

The function is curried, allowing you to partially apply the string separator
before applying it to the array.

### length

Returns the number of elements in an array.

#### Signature

```typescript
length<T>(array: T[]): number
```

#### Parameters

- `array`: An array of type `T[]`. The array for which the length is to be
  determined.

#### Returns

The function returns a number representing the number of elements in the array.

#### Example

```typescript
const array = [1, 2, 3, 4, 5];
const result = length(array);
console.log(result); // Output: 5
```

### unique

```typescript
unique<T>(key: (x: T) => Primitive): (array: T[]) => any[]
```

This function takes an array and a key function as parameters and returns a new
array with unique items based on the key.

- `key`: A function that extracts a primitive value from each item in the array.

**Example**

```typescript
const array = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 1, name: "John" },
  { id: 3, name: "John" },
];

const uniqueById = unique((item) => item.id);
const uniqueArray = uniqueById(array);

console.log(uniqueArray);
// Output: [
//   { id: 1, name: 'John' },
//   { id: 2, name: 'Jane' },
//   { id: 3, name: 'John' },
// ]
```

In this example, the `unique` function is used to remove duplicates from the
array of objects based on the `id` property. The resulting array only contains
objects with unique `id` values.

### concat

Concatenates an array of arrays into a single array.

**Signature**

```typescript
(array: unknown[][]) => any[]
```

**Parameters**

- `array`: An array of arrays to be concatenated. Each sub-array can contain
  elements of any type.

**Returns**

- Returns a new array containing all elements from the input arrays.

**Example**

```typescript
const result = concat([[1, 2], [3, 4], [5, 6]]);
console.log(result); // Output: [1, 2, 3, 4, 5, 6]
```

In the example above, the `concat` function is called with an input array
`[[1, 2], [3, 4], [5, 6]]`. It returns a new array `[1, 2, 3, 4, 5, 6]` where
the elements from the sub-arrays are concatenated into a single array.

### reverse

**Signature:** `reverse(array: Input): Reversed<Input>`

**Parameters:**

- `array` - An array of unknown type.

**Return Type:** `Reversed<Input>`

The `reverse` function takes an array and returns a new array with the elements
reversed.

**Example**

```typescript
const arr = [1, 2, 3, 4];
const reversedArray = reverse(arr);
console.log(reversedArray); // Output: [4, 3, 2, 1]
```

### tail

```typescript
tail(x: unknown[]): unknown[]
```

The `tail` function takes an array `x` and returns a new array with all the
elements except the first element.

#### Example

```typescript
const arr = [1, 2, 3, 4, 5];
const result = tail(arr);
console.log(result);
// Output: [2, 3, 4, 5]
```

In the example above, the `tail` function is used to remove the first element of
the `arr` array. The resulting array `[2, 3, 4, 5]` is then stored in the
`result` variable and logged to the console.

### `head`

Returns the first element of an array or string.

#### Signature

```typescript
head<T extends (any[] | string)>(x: T): T[0]
```

#### Parameters

- `x`: The array or string from which to retrieve the first element.

#### Returns

The first element of the given array or string.

#### Example

```typescript
const arr = [1, 2, 3, 4];
const str = "Hello";

const firstElementOfArr = head(arr); // 1
const firstCharacterOfStr = head(str); // "H"
```

### init

`init(x: unknown[]): unknown[]`

This function takes an array `x` and returns a new array with all elements
except the last one.

#### Parameters

- `x: unknown[]`: The array to be modified.

#### Returns

- `unknown[]`: A new array with all elements of `x` except the last one.

#### Example

```javascript
const arr = [1, 2, 3, 4, 5];
const result = init(arr);
console.log(result); // Output: [1, 2, 3, 4]
```

In the above example, the `init` function is called with the `arr` array as an
argument. The function returns a new array `[1, 2, 3, 4]`, which contains all
elements of the original array `arr` except the last one.

### `second`

```typescript
function second<T extends (unknown[] | string)>(x: T): T[1];
```

The `second` function takes an argument `x` of type `T`, where `T` is an array
or a string. It returns the second element (index `1`) of the array or string.

#### Example

```typescript
console.log(second([1, 2, 3])); // Output: 2
console.log(second("hello")); // Output: 'e'
```

In the first example, the `second` function returns `2`, which is the second
element in the array `[1, 2, 3]`. In the second example, it returns `'e'`, which
is the second character in the string `'hello'`.

### third

**Signature:** `function third<T extends (unknown[] | string)>(x: T): T[2]`

Returns the third element of the input array or string.

- `T` generic type that extends an array or string.
- `x` the input array or string.

**Example**

```typescript
third([1, 2, 3, 4]); // returns 3
third("hello"); // returns 'l'
```

### last

**Signature:** `<T>(x: T[]) => x[x.length - 1]`

The `last` function takes an array `x` of type `T[]` and returns the last
element of the array.

**Example**

```typescript
const numbers = [1, 2, 3, 4, 5];
const lastNumber = last(numbers);
console.log(lastNumber); // Output: 5
```

```typescript
const names = ["Alice", "Bob", "Charlie", "David"];
const lastName = last(names);
console.log(lastName); // Output: "David"
```

### empty

```typescript
empty<T>(x: T[]): boolean
```

This function checks if an array is empty.

#### Parameters

- `x: T[]` - The array to check if it is empty.

#### Returns

- `boolean` - Returns `true` if the array is empty, `false` otherwise.

#### Example

```typescript
const arr1 = [1, 2, 3];
const arr2 = [];

empty(arr1); // false
empty(arr2); // true
```

### `nonempty(x: T[]): boolean`

This function checks if an array `x` is non-empty.

#### Parameters

- `x: T[]` - an array of any type `T`

#### Returns

- `boolean` - `true` if the array `x` is non-empty, `false` otherwise

#### Example

```typescript
const arr1: number[] = [1, 2, 3];
const arr2: string[] = [];
const arr3: boolean[] = [true, false];

console.log(nonempty(arr1)); // Output: true
console.log(nonempty(arr2)); // Output: false
console.log(nonempty(arr3)); // Output: true
```

### wrapArray

**Signature:** `(x: T) => T[]`

#### Description:

This function takes an input value `x` and returns an array containing `x` as
its only element. It essentially wraps the given value in an array.

#### Example

```typescript
wrapArray("hello"); // returns ["hello"]
wrapArray(42); // returns [42]
wrapArray({ name: "John", age: 25 }); // returns [{ name: "John", age: 25 }]
```

### zip

```typescript
zip<T extends unknown[][]>(
  ...args: T
): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[]
```

The `zip` function takes in multiple arrays as arguments (spread syntax) and
returns a new array composed of the corresponding elements from each input
array.

#### Parameters

- `...args: T`: The arrays to zip together. The type `T` represents a tuple of
  arrays, where each array may have different element types.

#### Return Type

The return type is an array of tuples, where each tuple contains the
corresponding elements from the input arrays. The element types of the tuples
are inferred from the input arrays, and any arrays with different element types
will result in a type of `never` for that position in the resulting tuple.

#### Example

```typescript
const array1 = [1, 2, 3];
const array2 = ["a", "b", "c"];
const array3 = [true, false, true];

const zipped = zip(array1, array2, array3);
// zipped = [
//   [1, 'a', true],
//   [2, 'b', false],
//   [3, 'c', true],
// ]
```

In this example, the `zip` function is called with three arrays of different
element types. The resulting `zipped` array contains tuples where the first
element is a number, the second element is a string, and the third element is a
boolean.

### sortCompare

```typescript
comparator:
((x: X, y: X) => number | boolean);
```

The `sortCompare` function is a higher-order function that takes a `comparator`
function as input and returns a new function that can be used to sort an array.

#### Example

```typescript
const numbers = [3, 1, 2];
const descendingComparator = (x: number, y: number) => y - x;
const sortedNumbers = sortCompare(descendingComparator)(numbers);
console.log(sortedNumbers); // [3, 2, 1]
```

In this example, the `sortCompare` function is used to sort an array of numbers
in descending order using a custom `comparator` function. The resulting sorted
array is then logged to the console.

### sortKey

`sortKey` is a higher-order function that takes a `key` function as a parameter
and returns a `sortCompare` function.

#### Signature

```typescript
sortKey<X>(key: (_: X) => Comparable): (xs: X[]) => X[]
```

#### Parameters

- `key` : A function that takes an element of type `X` and returns a value of
  type `Comparable`. This value will be used to compare elements during sorting.

#### Return Type

- `(xs: X[]) => X[]` : A function that takes an array of type `X` and returns a
  sorted array of type `X` based on the `key` function.

#### Example

```typescript
const sortByAge = sortKey((person) => person.age);
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 20 },
];
const sortedPeople = sortByAge(people);
console.log(sortedPeople);
// Output: [
//   { name: "Charlie", age: 20 },
//   { name: "Alice", age: 25 },
//   { name: "Bob", age: 30 }
// ]
```

In the example above, `sortKey` is used to create a `sortByAge` function that
can sort an array of people based on their age. The `key` function is provided
as a lambda function `(person) => person.age`. The `sortByAge` function is then
used to sort the `people` array and the result is stored in the `sortedPeople`
array. The `sortedPeople` array is then printed to the console showing the
sorted order based on the age of the people.

### range

```typescript
range(start: number, end: number): any[]
```

Creates an array of numbers from `start` to `end` (exclusive).

#### Parameters

- `start`: The starting number of the range.
- `end`: The ending number of the range (exclusive).

#### Return Type

- `any[]`: An array of numbers.

#### Example

```typescript
const numbers = range(1, 5);
console.log(numbers);
// Output: [1, 2, 3, 4]
```

In this example, `range(1, 5)` returns an array of numbers from 1 to 4
(exclusive). The resulting array is `[1, 2, 3, 4]`.

### contains

**Signature:** `(x: T) => (array: T[]) => boolean`

The `contains` function takes a value `x` of generic type `T` and returns a
closure that takes an array `array` of type `T[]` and returns a boolean value
indicating whether the array contains the given value or not.

**Example**

```javascript
const checkForValue = contains(3);
console.log(checkForValue([1, 2, 3, 4])); // true
console.log(checkForValue([5, 6, 7])); // false
```

### includedIn

Returns a function that checks if a given value is included in an array.

#### Signature

```typescript
(<T>(array: T[]) => (x: T) => array.includes(x));
```

#### Parameters

- `array`: An array of values to check if the given value is included.

#### Returns

A function that takes a value (`x`) and returns `true` if the value is included
in the array, otherwise `false`.

#### Example

```javascript
const fruits = ["apple", "banana", "orange"];
const isIncluded = includedIn(fruits);

console.log(isIncluded("apple")); // true
console.log(isIncluded("grape")); // false
```

### take

Signature: `(n: number) => (xs: T[]) => T[]`

This function takes a number `n` and returns a function that takes an array `xs`
and returns a new array containing the first `n` elements of `xs`.

#### Example

```typescript
const takeThree = take(3);
const numbers = [1, 2, 3, 4, 5];
console.log(takeThree(numbers)); // Output: [1, 2, 3]
```

### drop

`(n: number) => (xs: T[]) => T[]`

This function takes a number `n` as its argument and returns another function
that accepts an array `xs`. It returns a new array containing the elements of
`xs` starting from index `n` onwards.

#### Example

```typescript
const dropThree = drop(3);
const numbers = [1, 2, 3, 4, 5];
const result = dropThree(numbers); // [4, 5]
```

### enumerate

```typescript
enumerate<T>(xs: T[]): (number | T)[][]
```

The `enumerate` function takes an array `xs` and returns an array of arrays of
pairs containing the index and value of each element in the original array.

#### Parameters

- `xs: T[]` : The input array.

#### Returns

`(number | T)[][]` : An array of arrays where each inner array contains the
index and value of an element from the input array.

#### Example

```typescript
const array = ["a", "b", "c"];
const result = enumerate(array);
// result is [[0, 'a'], [1, 'b'], [2, 'c']]
```

### slidingWindow

```typescript
(<T>(l: number) => (xs: T[]) =>
  xs.flatMap((_, i) => (i <= xs.length - l ? [xs.slice(i, i + l)] : [])));
```

Creates a function that returns a sliding window view of a given array.

#### Parameters

- `l: number`: The size of the sliding window.

#### Returns

- `(xs: T[]) => any`: A function that takes an array of type `T` and returns an
  array of sliding window views.

#### Example

```typescript
const getWindowViews = slidingWindow(3);
const inputArray = [1, 2, 3, 4, 5];
const outputArray = getWindowViews(inputArray);
console.log(outputArray); // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
```

In the example above, the `slidingWindow` function is used to create a function
`getWindowViews` that generates sliding window views of size 3. The `inputArray`
is then passed to `getWindowViews` and the resulting `outputArray` contains all
sliding window views: `[[1, 2, 3], [2, 3, 4], [3, 4, 5]]`.

### pipe

Creates a pipeline of functions by composing them together. The output of one
function serves as the input to the next function in the pipeline.

#### Signature

```typescript
pipe<Fs extends Func[]>(...fs: ValidPipe<Fs>): Pipeline<Fs>
```

#### Parameters

- `...fs: ValidPipe<Fs>`: Rest parameter that accepts a series of functions to
  be piped together. Each function in the pipeline should have compatible input
  and output types.

#### Return Type

- `Pipeline<Fs>`: The type of the pipeline, which represents a function that
  takes multiple arguments and returns the final output after applying each
  function in the pipeline.

#### Example

```typescript
const add = (a: number, b: number): number => a + b;
const double = (x: number): number => x * 2;
const subtract = (a: number, b: number): number => a - b;

const myPipeline = pipe(add, double, subtract);
const result = myPipeline(5, 2); // Result: ((5 + 2) * 2) - 2 = 12
```

In the example above, `myPipeline` is created by piping together the `add`,
`double`, and `subtract` functions. When `myPipeline` is called with arguments
`5` and `2`, it applies each function in the pipeline sequentially and returns
the final output `12`.

### compose

**Signature**:

```typescript
compose<Fs extends Func[]>(...fs: Fs): Fs extends ValidPipe<Reversed<Fs>> ? Pipeline<Reversed<Fs>> : never
```

Compose takes in an array of functions and returns a new function that is the
composition of these functions. The returned function takes in an initial input
and passes it through each function in the array, applying them in reverse
order.

If the array of functions is a valid pipe (i.e., each function's return type
matches the argument type of the next function), the return type of the composed
function is a pipeline of the reversed array of functions. Otherwise, it returns
`never`.

**Example**:

```typescript
const addOne = (num: number) => num + 1;
const double = (num: number) => num * 2;
const subtract = (num1: number, num2: number) => num1 - num2;

const composed = compose(addOne, double, subtract);
const result = composed(5, 2);

console.log(result); // Output: 16
```

In the example above, we have three functions: `addOne`, `double`, and
`subtract`. We use `compose` to create a new function `composed` by composing
these functions. When we invoke `composed` with the arguments `5` and `2`, the
composition is applied in reverse order: `subtract` is first called with the
arguments `5` and `2`, the result is then passed to `double`, and finally the
output of `double` is passed to `addOne`. The final result is `16`.

### after

```typescript
(<T>(f: UnaryFn<T, unknown>) => <L extends unknown[]>(g: (...args: L) => T) =>
  pipe(g, f));
```

The `after` function is a higher-order function that takes another function `f`
as an argument and returns a new function. The returned function takes a generic
function `g` as an argument and returns the result of piping `g` through `f`
using the `pipe` function.

#### Example

```typescript
const double = (value: number): number => value * 2;
const square = (value: number): number => value * value;

const calculate = after(square)(double);

console.log(calculate(3)); // Output: 18
```

In the above example, `after(square)(double)` returns a new function
`calculate`. When `calculate` is called with the argument `3`, it pipes the
argument through `square` and then through `double`, resulting in the output
`18` (3 * 3 * 2 = 18).

### before

```typescript
before<T>(f1: (...args: unknown[]) => T): (f2: (input: T) => unknown) => Pipeline<[(...args: unknown[]) => T, (input: T) => unknown]>
```

The `before` function takes in a function `f1` and returns a higher-order
function that takes in another function `f2`. It then returns a `Pipeline` that
consists of `f1` and `f2`, with `f1` as the first function in the pipeline and
`f2` as the second function.

#### Example

```typescript
const addOne = (num: number) => num + 1;
const double = (num: number) => num * 2;

const pipeline = before(addOne)(double);
const result = pipeline(5); // 12
```

In the above example, `addOne` is the first function in the pipeline, and
`double` is the second function. When the `pipeline` is called with the input
`5`, it applies `addOne` first, resulting in `6`, and then applies `double`,
resulting in `12`.

### `complement`

**Signature:** `complement(f: F): (...x: Parameters<F>) => boolean`

The `complement` function takes a function `f` as input and returns a new
function that is the logical complement of `f`. The returned function takes the
same arguments as `f` and returns a boolean value based on the negation of the
result of `f`.

**Parameters:**

- `f`: The function to be complemented.

**Return Type:** `(...x: Parameters<F>) => boolean`

**Example**

```typescript
const greaterThanTen = (num: number) => num > 10;
const isLessThanOrEqualToTen = complement(greaterThanTen);

console.log(isLessThanOrEqualToTen(5)); // true
console.log(isLessThanOrEqualToTen(15)); // false
```

In the above example, the `complement` function is used to create a new function
`isLessThanOrEqualToTen` that is the logical complement of the `greaterThanTen`
function. When `isLessThanOrEqualToTen` is called with a number, it returns
`true` if the number is less than or equal to 10, and `false` otherwise.

### `sideEffect`

```typescript
(<T>(f: (_: T) => void) => (x: T) => {
  f(x);
  return x;
});
```

The `sideEffect` function is a higher-order function that takes a function `f`
as its parameter. The parameter `f` is a function that accepts a value of type
`T` and has a return type of `void`. The `sideEffect` function returns another
function that also takes a value of type `T` as its parameter and returns the
same value.

The purpose of the `sideEffect` function is to enable side effects by executing
the function `f` with a given value of type `T`, while still returning that
value. This allows for the execution of side effects without losing the
reference to the value being operated on.

#### Example

```javascript
const printAndReturn = sideEffect(console.log);
const result = printAndReturn("Hello, World!");

// Output: Hello, World!
console.log(result); // 'Hello, World!'
```

In this example, the `sideEffect` function is used to wrap the `console.log`
function, enabling it to print a message to the console and return the same
message. The `printAndReturn` function is then used to execute
`console.log('Hello, World!')`, and the result is stored in the `result`
variable, which is then logged to the console.

### wrapSideEffect

**Signature:**

```typescript
(<Args extends unknown[], Result>(
  cleanup: (...args: Args) => void | Promise<void>,
) =>
(f: (...args: Args) => Result) =>
(...args: Args) => any);
```

**Parameters:**

- `cleanup`: A function that takes in any number of arguments `Args` and returns
  either `void` or `Promise<void>`. This function will be executed after the
  wrapped function `f` is called.

**Return Type:**

`(f: (...args: Args) => Result) => (...args: Args) => any`

**Description:**

The `wrapSideEffect` function takes in a `cleanup` function and returns a new
function that wraps another function `f`. The returned function takes in any
number of arguments `Args` and returns a function that will execute the cleanup
function after executing the wrapped function `f`.

If the result of `f` is a `Promise`, the cleanup function will be executed after
the promise resolves. If the cleanup function also returns a `Promise`, the
final result will be the result of the wrapped function. Otherwise, the final
result will be the result of the cleanup function.

**Example**

```typescript
const cleanupFunction = (arg1: string, arg2: number) => {
  console.log(`Cleaning up with arguments ${arg1} and ${arg2}`);
};

const wrappedFunction = wrapSideEffect(cleanupFunction)(
  (arg1: string, arg2: number) => {
    console.log(
      `Executing wrapped function with arguments ${arg1} and ${arg2}`,
    );
    return arg1 + arg2;
  },
);

wrappedFunction("Hello", 123);
// Output:
// Executing wrapped function with arguments Hello and 123
// Cleaning up with arguments Hello and 123
// Result: Hello123
```

### applyTo

```typescript
applyTo(...args: A): (f: (...args: A) => unknown) => unknown
```

This higher-order function takes in a variable number of arguments `args` of
type `A`, and returns another function that takes in a function `f` which
accepts the same arguments `args` and returns a value of type `unknown`.

#### Parameters

- `...args: A`: A variadic parameter representing a variable number of arguments
  of type `A`.

#### Return Type

`(f: (...args: A) => unknown) => unknown`: A function that accepts a function
`f` and returns a value of type `unknown`.

#### Example

```typescript
const addNumbers = (a: number, b: number) => a + b;
const applyToExample = applyTo(10, 20);
const result = applyToExample(addNumbers); // 30
```

### always

**Signature:** `always<T>(x: T) => () => T`

Creates a function that always returns the same value.

- `x`: The value to be always returned.

**Returns:** A function that when called, always returns the provided value `x`.

**Example**

```typescript
const constantFunc = always(42);
console.log(constantFunc()); // Output: 42
```

### identity

**Signature:** `(x: T) => T`

The `identity` function takes in an argument `x` of type `T` and returns it as
is, without any modifications.

**Example**

```typescript
const result: number = identity(5);
console.log(result); // Output: 5

const result2: string = identity("hello");
console.log(result2); // Output: "hello"
```

### ifElse

```typescript
ifElse<Predicate, If, Else>(
  predicate: Predicate,
  fTrue: If,
  fFalse: Else,
): (...x: Parameters<Predicate>) => [Predicate, If, Else] extends import("/home/uri/uriva/gamlajs/src/typing").AnyAsync<[Predicate, If, Else]> ? Promise<Awaited<ReturnType<If>> | Awaited<ReturnType<Else>>> : ReturnType<If> | ReturnType<Else>
```

This function takes a predicate, a function to execute if the predicate is true,
and a function to execute if the predicate is false. It returns a new function
that accepts the same arguments as the predicate and invokes either `fTrue` or
`fFalse` based on the result of the predicate.

#### Example

```typescript
const isEven = (num: number): boolean => num % 2 === 0;

const multiplyByTwo = (num: number): number => num * 2;
const divideByTwo = (num: number): number => num / 2;

const conditionalFunction = ifElse(
  isEven,
  multiplyByTwo,
  divideByTwo,
);

console.log(conditionalFunction(4)); // Output: 8
console.log(conditionalFunction(5)); // Output: 2.5
```

In the example above, the `ifElse` function is used to create a new function
called `conditionalFunction`. This function checks if a given number is even,
and if it is, it multiplies it by two. If the number is odd, it divides it by
two. The `conditionalFunction` is then invoked with different input numbers to
test the conditional logic.

### unless

```typescript
unless<Predicate extends (
  | ((_: any) => BooleanEquivalent)
  | ((_: any) => Promise<BooleanEquivalent>)
)>(
  predicate: Predicate,
  fFalse: (_: Parameters<Predicate>[0]) => any,
): (...x: Parameters<Predicate>) => [Predicate, (...x: Parameters<Predicate>) => any, (_: Parameters<Predicate>[0]) => any] extends ([Predicate, (...x: Parameters<Predicate>) => any, (_: Parameters<Predicate>[0]) => any] extends [infer _1 extends import("/home/uri/uriva/gamlajs/src/typing").AsyncFunction, ...infer _2] ? any : any) ? Promise<any> : any
```

The `unless` function takes a `predicate` function and a `fFalse` function. It
returns a function that takes any number of arguments and checks if the
`predicate` is false. If the `predicate` is false, it calls the `fFalse`
function with the arguments and returns the result. If the `predicate` is true,
it returns the arguments.

Example

```typescript
const isFalsey = (x: any) => !x;

const fFalse = (x: any) => `The value ${x} is false`;

const result = unless(isFalsey, fFalse)(false);

console.log(result); // The value false is false
```

In this example, the `unless` function is used to check if the value `false` is
falsey. Since it is falsey, the `fFalse` function is called with the value
`false` and the result is returned.

### when

```typescript
when<Predicate extends (
  | ((_: any) => BooleanEquivalent)
  | ((_: any) => Promise<BooleanEquivalent>)
)>(predicate: Predicate, fTrue: (_: Parameters<Predicate>[0]) => any): (...x: Parameters<Predicate>) => [Predicate, (_: Parameters<Predicate>[0]) => any, (...x: Parameters<Predicate>) => any] extends ([Predicate, (_: Parameters<Predicate>[0]) => any, (...x: Parameters<Predicate>) => any] extends [infer _1 extends import("/home/uri/uriva/gamlajs/src/typing").AsyncFunction, ...infer _2] ? any : any) ? Promise<any> : any
```

The `when` function is a higher-order function that takes a predicate function
and a callback function. It returns a new function that checks if the predicate
function returns true, and if so, calls the callback function.

#### Parameters

- `predicate: Predicate` - The predicate function that determines whether the
  callback function should be called.
- `fTrue: (_: Parameters<Predicate>[0]) => any` - The callback function to be
  called if the predicate function returns true.

#### Return Value

The return value of `when` depends on the types of the `Predicate` and `fTrue`
parameters. If the `Predicate` is an `AsyncFunction`, the return value is a
`Promise<any>`. Otherwise, it is `any`.

#### Example

```typescript
const isEven = (num: number) => num % 2 === 0;

const callback = (num: number) => {
  console.log(`${num} is even`);
};

const whenIsEven = when(isEven, callback);

whenIsEven(10); // logs "10 is even"
whenIsEven(5); // does nothing
```

In this example, the `isEven` function is used as the predicate to check if a
number is even. If the number is even, the `callback` function is called and
logs a message. The `whenIsEven` function is created using the `when` function,
and when called with an even number, it logs a message.

### cond

```typescript
CondElements extends CondElement<any[]>[]

cond(
  predicatesAndResolvers: CondElements,
): (
  ...x: Parameters<CondElements[0][0]>
) => any
```

The `cond` function takes an array of predicates and resolvers and returns a
function that when called with arguments, runs each predicate on the arguments
and returns the result of the first resolver that matches the predicate.

#### Example

```typescript
const isEven = (x: number) => x % 2 === 0;
const double = (x: number) => x * 2;
const triple = (x: number) => x * 3;

const resolver = cond([
  [isEven, double],
  [() => true, triple],
]);

console.log(resolver(4)); // Output: 8
console.log(resolver(3)); // Output: 9
```

### logWith

**Signature:** `(x: any[]) => (y: T) => T`

#### Description:

This function takes in any number of arguments, `...x`, and returns a new
function that takes in a value `y`. The returned function logs the arguments
passed in as `x`, along with `y`, to the console, and then returns `y`.

#### Example

```typescript
const log = logWith("Hello");
const result = log("World");
// Output: Hello World
// result: "World"
```

### asyncTimeit

```typescript
asyncTimeit<Args extends unknown[], R>(
  handler: (time: number, args: Args, result: R) => void,
  f: (..._: Args) => R,
): (...args: Args) => Promise<R>
```

The `asyncTimeit` function is a higher-order function that takes a handler
function and another function `f`, and returns a new function that measures the
execution time of `f` and invokes the handler with the elapsed time, arguments,
and result of `f`. The returned function is asynchronous and returns a promise
of the result.

#### Parameters

- `handler: (time: number, args: Args, result: R) => void` - The handler
  function to be invoked with the elapsed time, arguments, and result of `f`.
- `f: (..._: Args) => R` - The function to be measured.

#### Returns

A new function that is asynchronous and returns a promise of the result of `f`.

#### Example

```typescript
const fetchData = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const timeHandler = (time: number, args: [string], result: any) => {
  console.log(`Fetch from ${args[0]} took ${time} milliseconds`);
};

const timedFetchData = asyncTimeit(timeHandler, fetchData);
const data = await timedFetchData("https://example.com/api/data");
console.log(data);
```

In the example above, the `timedFetchData` function is created by passing the
`timeHandler` and `fetchData` functions to `asyncTimeit`. When `timedFetchData`
is called with a URL, it measures the execution time of `fetchData` and logs the
elapsed time. The result of `fetchData` is returned and can be used further in
the code.

### `timeit`

Signature:
`(handler: (time: number, args: Args, result: R) => void, f: (..._: Args) => R) => (...args: Args) => R`

This function is a higher-order function that takes two parameters:

- `handler`: A function that receives three parameters: `time` (duration in
  milliseconds), `args` (the arguments passed to the inner function), and
  `result` (the result returned by the inner function).
- `f`: The inner function that will be timed.

The `timeit` function returns a new function that has the same signature as the
inner function (`(...args: Args) => R`). This new function will measure the
execution time of the inner function and call the `handler` function with the
measured time, arguments, and result.

Example

```typescript
const logTime = (time: number, args: number[], result: number) => {
  console.log(`Execution time: ${time}ms`);
  console.log(`Arguments: ${args}`);
  console.log(`Result: ${result}`);
};

const add = (a: number, b: number) => a + b;
const timedAdd = timeit(logTime, add);

timedAdd(2, 3);
// Output:
// Execution time: <duration>ms
// Arguments: 2, 3
// Result: 5
```

In this example, the `logTime` function logs the execution time, arguments, and
result. The `add` function adds two numbers. The `timedAdd` function is created
using `timeit`, passing `logTime` as the handler and `add` as the inner
function. When `timedAdd` is called with arguments `2` and `3`, it measures the
execution time of `add` and logs the time, arguments, and result.

### assert

```typescript
(<T>(condition: (_: T) => boolean, errorMessage: string) => (x: T) => T);
```

The `assert` function takes a condition and an error message as parameters and
returns a function that takes a value of type `T` and returns that value if the
condition is true. If the condition is false, it throws an error with the given
error message.

Example usage:

```typescript
const greaterThanZero = assert(
  (x: number) => x > 0,
  "Number must be greater than zero",
);
const result = greaterThanZero(5); // returns 5
const error = greaterThanZero(-2); // throws an error with the message "Number must be greater than zero"
```

### filter

```typescript
filter<F extends Predicate>(f: F): (
  _: ParamOf<F>[],
) => F extends AsyncFunction ? Promise<ParamOf<F>[]> : ParamOf<F>[]
```

This function takes in a predicate function `f` and returns a new function that
filters an array based on that predicate. The filtered array is returned as the
result.

- `f`: The predicate function that determines whether an element should be
  included in the filtered array or not.

Example

```typescript
const isEven = (num: number) => num % 2 === 0;

const numbers = [1, 2, 3, 4, 5];

const filteredNumbers = filter(isEven)(numbers);

console.log(filteredNumbers); // Output: [2, 4]
```

In the above example, the `filter` function is used to filter out the even
numbers from the `numbers` array. The resulting filtered array contains only the
even numbers [2, 4].

### find

#### Signature

```typescript
((Fn: Predicate) => Pipeline);
```

#### Description

The `find` function takes a predicate function as an argument and returns a
pipeline that filters an array based on the given predicate and returns the
first element of the filtered array.

#### Example

```typescript
const animals = ["cat", "dog", "elephant", "bird"];

const startsWithC = (animal) => animal.startsWith("c");

const result = find(startsWithC)(animals);

console.log(result); // 'cat'
```

In the above example, the `find` function is used to filter the `animals` array
based on the `startsWithC` predicate function and returns the first element that
matches the predicate, which is `'cat'`.

#### Return Type

```typescript
Pipeline<
  [
    (
      _: ParamOf<Fn>[],
    ) => Fn extends AsyncFunction ? Promise<ParamOf<Fn>[]> : ParamOf<Fn>[],
    <T extends string | any[]>(x: T) => T[0],
  ]
>;
```

The `find` function returns a pipeline that takes an array as input and returns
the first element of the filtered array based on the provided predicate
function.

### remove

```typescript
remove<F extends Predicate>(f: F): (x: Parameters<F>[0][]) => Parameters<F>[0][]
```

The `remove` function takes a predicate `f` and returns a new function that
removes elements from an array that satisfy the predicate.

#### Parameters

- `f: F`: The predicate function to test each element of the array. The function
  `f` should accept an argument of the same type as the elements in the array
  and return a boolean.

#### Returns

- `(x: Parameters<F>[0][]) => Parameters<F>[0][]`: A new function that accepts
  an array and returns a new array with elements removed based on the provided
  predicate.

#### Example

```typescript
const numbers = [1, 2, 3, 4, 5];

const isEven = (n: number): boolean => n % 2 === 0;

const removeEven = remove(isEven);
const result = removeEven(numbers);

console.log(result);
// Output: [1, 3, 5]
```

In the example above, the `remove` function is used to create a new function
`removeEven` that removes even numbers from an array. The `result` array
contains only the odd numbers `[1, 3, 5]`.

### intersectBy

```typescript
<T>(f: (x: T) => Primitive) => (arrays: T[][]) => T[]
```

The `intersectBy` function takes a function `f` that maps elements of type `T`
to `Primitive`, and returns another function that takes an array of arrays of
type `T` (`arrays`). It then intersects all the arrays in `arrays` based on the
values of `f`, and returns an array containing the common elements.

**Parameters:**

- `f: (x: T) => Primitive` - A function that maps elements of type `T` to
  `Primitive`. This function will be used to determine the intersections.

**Returns:**

- `(arrays: T[][]) => T[]` - The function takes an array of arrays of type `T`
  and returns an array of type `T` containing the common elements.

**Example**

```typescript
const numbers = [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [3, 6, 9, 12, 15]];
const intersectByPrimitive = intersectBy((x) => x % 10);

console.log(intersectByPrimitive(numbers));
// Output: [2, 4, 6]

const strings = [
  ["apple", "banana", "cherry"],
  ["banana", "kiwi", "pineapple"],
  ["cherry", "kiwi", "orange"],
];
const intersectByLength = intersectBy((x) => x.length);

console.log(intersectByLength(strings));
// Output: ['banana', 'kiwi']
```

In the example above, we have two arrays `numbers` and `strings`. The
`intersectByPrimitive` function is created by passing a function that maps
numbers to their remainder when divided by 10. The resulting function is then
used to intersect the arrays in `numbers`, resulting in an array `[2, 4, 6]`,
which are the elements common to all arrays in `numbers`.

Similarly, the `intersectByLength` function is created by passing a function
that maps strings to their lengths. The resulting function is then used to
intersect the arrays in `strings`, resulting in an array `['banana', 'kiwi']`,
which are the strings common to all arrays in `strings` based on their lengths.

### batch

```typescript
batch(
  keyFn: (_: TaskInput) => TaskKey,
  maxWaitMilliseconds: number,
  execute: Executor<TaskInput, Output>,
  condition: (_: TaskInput[]) => boolean,
): Pipeline<[(x: TaskInput) => JuxtOutput<[(x: TaskInput) => TaskInput, (_: TaskInput) => TaskKey]>, ([input, key]: [TaskInput, TaskKey]) => Promise<ElementOf<Output>>]>
```

The `batch` function takes in four parameters: `keyFn`, `maxWaitMilliseconds`,
`execute`, and `condition`. It returns a pipeline that consists of two steps.

- `keyFn` is a function used to determine the key for each task. It takes in a
  `TaskInput` and returns a `TaskKey`.
- `maxWaitMilliseconds` is the maximum time to wait before executing the batched
  tasks.
- `execute` is the function responsible for executing the tasks. It takes in a
  `TaskInput` and returns an `Output`.
- `condition` is a function that determines whether the batched tasks should be
  executed or not. It takes in an array of `TaskInput` and returns a boolean.

The first step of the pipeline is a juxt, which combines two functions:

- The first function in the juxt is `(x: TaskInput) => TaskInput`, which simply
  returns the `TaskInput`.
- The second function in the juxt is `(_: TaskInput) => TaskKey`, which uses the
  `keyFn` to determine the key for the task.

The second step of the pipeline is a function that takes in `[input, key]`,
which is the output of the previous step. It returns a promise that resolves to
the `ElementOf<Output>`.

Example

```typescript
const keyFn = (input: string) => input.charAt(0);
const maxWaitMilliseconds = 1000;
const execute = (input: string) => input.toUpperCase();
const condition = (inputs: string[]) => inputs.length >= 3;

const batchedTask = batch(keyFn, maxWaitMilliseconds, execute, condition);
const promise = batchedTask("apple");

promise.then((result) => {
  console.log(result); // Output: "APPLE"
});
```

In this example, the `batchedTask` function is created with the provided
`keyFn`, `maxWaitMilliseconds`, `execute`, and `condition`. When the
`batchedTask` is called with the input "apple", it will wait for more tasks with
the same key (in this case, the first character of the input) to be batched or
wait for the maximum wait time before executing the batched tasks. Once
executed, the promise will resolve with the output of the `execute` function,
which in this case is "APPLE".

### timeout

`timeout` is a function that takes in a timeout duration in milliseconds, a
fallback function, and an asynchronous function. It returns a new function that
incorporates the timeout functionality.

#### Signature

```typescript
timeout<Args extends unknown[], Output>(
  ms: number,
  fallback: (..._: Args) => Output | Promise<Output>,
  f: (..._: Args) => Promise<Output>,
): (...args: Args) => Promise<Output>
```

#### Parameters

- `ms: number`: The duration for the timeout in milliseconds.
- `fallback: (..._: Args) => Output | Promise<Output>`: The fallback function to
  be called if the async function does not resolve within the timeout duration.
- `f: (..._: Args) => Promise<Output>`: The asynchronous function to be
  executed.

#### Return Type

`(...args: Args) => Promise<Output>`: The returned function takes the same
arguments as the original asynchronous function and returns a promise that
resolves to the output of the original function or the fallback function.

#### Example

```typescript
const doSomethingAsync = async (arg: string) => {
  // ... some time-consuming asynchronous operation
  return arg.toUpperCase();
};

const timeoutDoSomething = timeout(2000, () => "Timeout", doSomethingAsync);

timeoutDoSomething("hello")
  .then(console.log)
  .catch(console.error);
```

In this example, the `timeoutDoSomething` function will execute the
`doSomethingAsync` function. If `doSomethingAsync` takes longer than 2000
milliseconds to resolve, the fallback function `() => "Timeout"` will be called
instead and its result will be returned.

### `juxt(...fs: Functions)`

This function takes in an array of functions `fs` and returns a new function.
The returned function takes the same parameters as the first function in `fs`
and applies each function in `fs` to those parameters. The result is an array of
the return values from each function in `fs`.

#### Example

```typescript
const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;
const multiply = (a: number, b: number) => a * b;

const juxtFunc = juxt(add, subtract, multiply);

console.log(juxtFunc(5, 3)); // [8, 2, 15]
```

In this example, `juxtFunc` is a function that takes two parameters `5` and `3`,
and applies each of the three functions `add`, `subtract`, and `multiply` to
those parameters. The result is an array `[8, 2, 15]`.

### `pairRight`

```ts
(pairRight: Function) => (x: Parameters<Function>[0]) => AwaitedResults<[<Parameters<Function>[0]>(x: Parameters<Function>[0]) => Parameters<Function>[0], Function]>
```

This function takes a `Function` as its parameter and returns a new function
that takes an argument `x` of the same type as the parameter of the original
function and returns a Promise that resolves to an array containing two
functions.

The first function in the array takes the same argument `x` and returns `x`. The
second function in the array takes the same argument `x` and applies it to the
original function `f`, returning the result.

Example

```ts
const increment = (num: number) => num + 1;

const pair = pairRight(increment);

const result = pair(5);

console.log(result);
// Output: [5, 6]
```

In the above example, the `pairRight` function is used to create a new function
`pair` by passing in the `increment` function. When `pair` is called with an
argument of `5`, it returns an array `[5, 6]` where `5` is the original argument
and `6` is the result of applying `increment` to `5`.

### stack

```typescript
/**
 * stack - Compose multiple functions together, passing the output of one function as the input to the next function.
 *
 * @param {...functions} - The functions to be composed.
 * @returns {(_: { [i in keyof Functions]: Parameters<Functions[i]>[0]; }) => JuxtOutput<Functions>} - A function that takes an object where each key corresponds to the input parameter of each function, and returns the output of the final composed function.
 */
stack<Functions extends Func[]>(
  ...functions: Functions
): (
  _: { [i in keyof Functions]: Parameters<Functions[i]>[0] },
) => JuxtOutput<Functions>
```

Example

```typescript
const add = (a: number) => (b: number) => a + b;
const multiply = (a: number) => (b: number) => a * b;

const stackFunctions = stack(add(2), multiply(3));

const result = stackFunctions({ _: 4 });
console.log(result); // { _: 4, plus: 6, times: 12 }
```

In the example above, the `stack` function is used to compose two functions -
`add` and `multiply`. The resulting composed function takes an object as input,
where the key `_` corresponds to the input for the first function (`add` in this
case). The composed function returns an object with the same input key (`_`) and
additional keys `plus` and `times`, representing the output of each function in
the composition. The example demonstrates calling the composed function with an
input of `{ _: 4 }` and logging the output `{ _: 4, plus: 6, times: 12 }`.

### juxtCat

#### Signature

```typescript
<Functions extends Func[]>(...fs: Functions): (..._: Parameters<Functions[0]>) => ReturnType<Functions[0]>
```

#### Description

`juxtCat` is a utility function that takes in multiple functions as arguments
and returns a new function. This new function applies the arguments to each of
the input functions and then concatenates the results together.

#### Parameters

- `...fs: Functions` : A rest parameter that accepts an array of functions
  (`Functions`) as input.

#### Return Value

The return value of `juxtCat` is a new function that takes in the same arguments
as the first function in the input `Functions` array, and returns the result
type of the first function.

#### Example

```typescript
const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;

const juxtMultipliedTotal = juxtCat(add, multiply);

console.log(juxtMultipliedTotal(2, 3)); // Output: [5, 6]
```

In the example above, `juxtMultipliedTotal` is a new function that takes two
arguments (`2` and `3`) and applies them to both the `add` and `multiply`
functions. The result is an array `[5, 6]`, which is the concatenation of the
results of the two functions.

### alljuxt

**Signature:**

```typescript
<Functions extends Func[]>(...fs: Functions): 
  (..._: Parameters<Functions[0]>) => 
     Functions extends AnyAsync<Functions> ? Promise<boolean> : boolean
```

The `alljuxt` function takes in an arbitrary number of functions as arguments
(`...fs: Functions`) and returns a new function that accepts the same arguments
as the first function (`..._: Parameters<Functions[0]>`). This new function then
applies each of the input functions to the arguments and returns a boolean value
indicating if all the functions returned `true`.

If the input functions contain at least one asynchronous function
(`Functions extends AnyAsync<Functions>`), the returned function will be
asynchronous and return a `Promise<boolean>`. Otherwise, it will be synchronous
and return a `boolean`.

**Example**

```typescript
const isEven = (n: number) => n % 2 === 0;
const greaterThanThree = (n: number) => n > 3;

const checkNumber = alljuxt(isEven, greaterThanThree);

console.log(checkNumber(6)); // Output: true
console.log(checkNumber(2)); // Output: false
console.log(checkNumber(5)); // Output: false
```

In the example above, the `alljuxt` function is used to create a new function
`checkNumber`. `checkNumber` accepts a number as an argument and applies the
`isEven` and `greaterThanThree` functions to the argument. It returns `true` if
both functions return `true`, otherwise it returns `false`.

### `anyjuxt`

```typescript
anyjuxt<Functions extends Func[]>(...fs: Functions): (..._: Parameters<Functions[0]>) => Functions extends AnyAsync<Functions> ? Promise<boolean> : boolean
```

The `anyjuxt` function takes multiple functions as arguments and returns a new
function. This new function takes the same arguments as the first function in
the `fs` array.

If any of the functions in the `fs` array returns `true` when called with the
provided arguments, then the `anyjuxt` function returns `true`. Otherwise, it
returns `false`.

If any of the functions in the `fs` array is an asynchronous function, the
`anyjuxt` function returns a promise that resolves to either `true` or `false`
depending on the results of the asynchronous functions.

#### Example

```typescript
const isEven = (n: number) => n % 2 === 0;
const isPositive = (n: number) => n > 0;

const hasEvenOrPositive = anyjuxt(isEven, isPositive);

console.log(hasEvenOrPositive(4)); // true
console.log(hasEvenOrPositive(-3)); // true
console.log(hasEvenOrPositive(7)); // false
```

In this example, the `hasEvenOrPositive` function checks if a number is even or
positive. It uses the `anyjuxt` function to combine the `isEven` and
`isPositive` functions. When called with `4`, which is even, the `anyjuxt`
function returns `true`. When called with `-3`, which is positive, the `anyjuxt`
function also returns `true`. When called with `7`, which is neither even nor
positive, the `anyjuxt` function returns `false`.

### withLock

```typescript
withLock(
  lock: () => void | Promise<void>,
  unlock: () => void | Promise<void>,
  f: Function,
): (...args: Parameters<Function>) => Promise<Awaited<ReturnType<Function>>>
```

The `withLock` function takes in three parameters: `lock`, `unlock`, and `f`. It
returns a new function that can be invoked with arguments. This new function
wraps the execution of `f` inside a lock.

- `lock`: A function that acquires a lock. It can be either synchronous or
  asynchronous and should return `void` or `Promise<void>`.

- `unlock`: A function that releases the lock. It can be either synchronous or
  asynchronous and should return `void` or `Promise<void>`.

- `f`: The function that is being locked. It can be any asynchronous or
  synchronous function.

The returned function can be called with any number of arguments that `f`
expects. The wrapped execution of `f` is guarded by the acquired lock. If an
exception is thrown within `f`, the lock is still released before re-throwing
the exception.

**Example**

```typescript
const lock = () =>
  new Promise<void>((resolve) => {
    console.log("Acquiring lock...");
    setTimeout(resolve, 1000);
  });

const unlock = () => {
  console.log("Releasing lock...");
};

const processResource = async (resource: string) => {
  console.log(`Processing resource: ${resource}`);
  // Simulate some work being done
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`Finished processing resource: ${resource}`);
};

const lockedProcessResource = withLock(lock, unlock, processResource);
lockedProcessResource("example.com");

// Output:
// Acquiring lock...
// Processing resource: example.com
// Finished processing resource: example.com
// Releasing lock...
```

In the example above, the `withLock` function is used to create a wrapped
version of the `processResource` function. The lock is acquired before
`processResource` is executed and released after it completes. This ensures that
only one instance of `processResource` can be executing at a time, preventing
race conditions when accessing shared resources.

### retry(f: () => boolean | Promise<boolean>): Promise<void>

This function retries executing a given function until it returns a truthy
value. It waits for 50 milliseconds between each execution.

#### Parameters

- `f`: A function that returns a boolean or a Promise that resolves to a
  boolean. This function is executed repeatedly until it returns a truthy value.

#### Return Value

A Promise that resolves to `void`.

#### Example

```javascript
async function testFunction() {
  let counter = 0;

  const f = () => {
    counter++;
    return counter > 3;
  };

  await retry(f);

  console.log("Success!"); // Output: Success! after 4 retries
}

testFunction();
```

### `makeLockWithId`

Creates a lock function that can be used to lock resources with a given ID.

#### Signature

`(set: (_: Key) => boolean | Promise<boolean>) => (id: Key) => Promise<void>`

#### Parameters

- `set: (_: Key) => boolean | Promise<boolean>`: A function that sets the lock
  status for a given ID. It should return `true` if the lock is successfully
  set, `false` otherwise, or a Promise resolving to either of these values.

#### Return Type

`(id: Key) => Promise<void>`: A function that locks a resource with the given
ID.

#### Example

```
const setLock = (id) => {
  // Perform logic to set the lock for the given ID
  // Return true if the lock is successfully set, false otherwise
};

const lockResource = makeLockWithId(setLock);

const resourceId = 'resource1';
lockResource(resourceId)
  .then(() => {
    console.log(`Resource ${resourceId} locked`);
    // Perform actions with the locked resource
  })
  .catch((error) => {
    console.error(`Failed to lock resource ${resourceId}`, error);
  });
```

In the above example, we have a function `setLock` that sets the lock status for
a given ID. We then use the `makeLockWithId` function to create a `lockResource`
function that can be used to lock resources by their IDs. We pass the `setLock`
function as the argument to `makeLockWithId`. We can then use the `lockResource`
function to lock a specific resource by its ID, and perform actions with the
locked resource once it is successfully locked.

### withLockByInput

The `withLockByInput` function wraps an asynchronous function `f` with a lock
using dynamic lock ID based on input arguments.

#### Signature

```typescript
withLockByInput<Function extends AsyncFunction>(
  argsToLockId: (..._: Parameters<Function>) => string,
  lock: (_: string) => Promise<void>,
  unlock: (_: string) => Promise<void>,
  f: Function,
): (...args: Parameters<Function>) => Promise<Awaited<ReturnType<Function>>>;
```

#### Parameters

- `argsToLockId` - A function that takes input arguments of `f` and returns a
  string representing the lock ID.
- `lock` - A function that takes a lock ID and locks it.
- `unlock` - A function that takes a lock ID and unlocks it.
- `f` - The asynchronous function to be wrapped with a lock.

#### Return Value

A function that takes the same input arguments as `f` and returns a promise that
resolves to the result of `f` after acquiring and releasing the lock.

#### Example

```typescript
const argsToLockId = (x: number, y: number) => `lock-${x}-${y}`;

const lock = (lockId: string) => Promise.resolve();

const unlock = (lockId: string) => Promise.resolve();

const add = async (x: number, y: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating asynchronous operation
  return x + y;
};

const wrappedAdd = withLockByInput(argsToLockId, lock, unlock, add);

wrappedAdd(2, 3).then(console.log); // Output: 5 (after a 1 second delay)
```

In the example above, the `wrappedAdd` function is created using
`withLockByInput` by providing the lock ID generator function `argsToLockId`,
the lock function `lock`, the unlock function `unlock`, and the async function
`add`. When `wrappedAdd` is called with arguments `(2, 3)`, it acquires a lock
with the lock ID `lock-2-3`, executes the `add` function, waits for it to
complete, releases the lock, and returns the result `5`.

### `sequentialized`

```typescript
(<Function extends AsyncFunction>(f: Function) =>
(...args: Parameters<Function>) => any);
```

The `sequentialized` function takes an asynchronous function `f` and returns a
new function that ensures that all invocations of `f` are processed in a
sequential order. It achieves this by creating a queue of pending invocations
and processing them one by one.

#### Example

```typescript
async function asyncFunction(num: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(num * 2);
    }, 1000);
  });
}

const sequentializedAsyncFunction = sequentialized(asyncFunction);

sequentializedAsyncFunction(2); // Invokes asyncFunction(2)
sequentializedAsyncFunction(4); // Waits for the previous invocation to complete before invoking asyncFunction(4)
sequentializedAsyncFunction(6); // Waits for the previous invocation to complete before invoking asyncFunction(6)
```

In this example, `asyncFunction` is an asynchronous function that takes a number
and returns a promise that resolves to the double of the number after a delay of
1 second.

The `sequentializedAsyncFunction` is obtained by calling the `sequentialized`
function with `asyncFunction`. When called multiple times, it ensures that each
invocation is added to a queue and processed sequentially.

In the example, `sequentializedAsyncFunction(2)` is called first, and it starts
processing immediately. Then `sequentializedAsyncFunction(4)` is called while
the first invocation is still running, so it is added to the queue. Finally,
`sequentializedAsyncFunction(6)` is called while both previous invocations are
still running, so it is also added to the queue.

Once the first invocation completes, the result is resolved and the second
invocation is started. Similarly, when the second invocation completes, the
result is resolved and the third invocation is started. This ensures that the
invocations are processed in the order they were made, even though each
invocation has a delay of 1 second.

### throttle

`throttle` is a higher-order function that limits the maximum number of parallel
invocations of an asynchronous function.

#### Signature

```typescript
throttle<Function extends AsyncFunction>(maxParallelism: number, f: Function): (...args: Parameters<Function>) => Promise<Awaited<ReturnType<Function>>>
```

#### Parameters

- `maxParallelism` : number - The maximum number of parallel invocations
  allowed.
- `f` : Function - The asynchronous function to be throttled.

#### Returns

A throttled version of the function `f`. The throttled function has the same
signature as `f`, and returns a promise that resolves to the result of invoking
`f`.

#### Example

```typescript
const asyncFunction = async (arg: number) => {
  // Simulating an asynchronous operation
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return arg * 2;
};

const throttledFunction = throttle(2, asyncFunction);

throttledFunction(5).then(console.log); // Output: 10
throttledFunction(10).then(console.log); // Output: 20
throttledFunction(15).then(console.log); // Output: 30
throttledFunction(20).then(console.log); // Output: 40

// While the maximum parallelism is set to 2, only 2 invocations are allowed to run concurrently.
// The other invocations are placed in a queue and executed once a slot becomes available.
```

### map

#### Signature

```typescript
map(f: Function): (xs: Parameters<Function>[0][]) => Function extends import("/home/uri/uriva/gamlajs/src/typing").AsyncFunction ? Promise<Awaited<ReturnType<Function>>[]> : ReturnType<Function>[]
```

#### Description

The `map` function takes a function `f` and returns a new function. The new
function takes an array `xs` and applies `f` to each element of `xs`. If `f` is
an asynchronous function, it returns a promise that resolves to an array of the
results of applying `f` to each element. Otherwise, it returns an array of the
results.

#### Example

```typescript
const multiplyByTwo = (n: number) => n * 2;
const numbers = [1, 2, 3, 4];

const result = map(multiplyByTwo)(numbers);
console.log(result);
// Output: [2, 4, 6, 8]
```

### mapCat

```typescript
<T, G>(f: Unary<T, G>) => (x: T[]): G
```

The `mapCat` function takes a unary function `f` and returns a new function that
applies `f` to each element of the input array `x`. The result is a new array
that contains the concatenated results of applying `f` to each element of `x`.

**Parameters:**

- `f: Unary<T, G>`: The unary function that will be applied to each element of
  the input array.

**Returns:**

- `(x: T[]): G`: A new function that applies `f` to each element of the input
  array `x` and returns the concatenated result.

**Example**

```typescript
const double = (x: number): number => x * 2;

const mapCatDouble = mapCat(double);

console.log(mapCatDouble([1, 2, 3])); // [2, 4, 6]
```

In this example, the `mapCat` function is used to create a new function
`mapCatDouble`, which applies the `double` function to each element of the input
array. The result is a new array `[2, 4, 6]`, where each element is the result
of doubling the corresponding element in the input array `[1, 2, 3]`.

### wrapObject(key: string)

This function takes a key as a parameter and returns a curried function that
takes a value and returns an object with the given key and value.

#### Signature

```typescript
wrapObject(key: string): <V>(value: V) => { [key: string]: V; }
```

#### Example

```typescript
const createObject = wrapObject("name");
const obj = createObject("John");
console.log(obj); // { name: "John" }
```

In the example above, we create a `createObject` function by passing the key
"name" to `wrapObject`. We then use `createObject` to create an object with the
key "name" and the value "John".

### groupByManyReduce

**Signature**

```typescript
groupByManyReduce<T, S, K extends Primitive>(
  keys: (_: T) => K[],
  reducer: Reducer<T, S>,
  initial: () => S,
): (it: T[]) => Record<K, S>
```

**Parameters**

- `keys: (_: T) => K[]`: A function that takes an element of type `T` and
  returns an array of keys of type `K`, which will be used for grouping the
  elements.
- `reducer: Reducer<T, S>`: A reducer function that takes an accumulated value
  of type `S` and an element of type `T`, and returns a new accumulated value of
  type `S`.
- `initial: () => S`: A function that returns the initial accumulated value.

**Return Type**

`(it: T[]) => Record<K, S>`: A higher-order function that takes an array of
elements of type `T` and returns a record object where the keys are of type `K`
and the values are the accumulated values of type `S` after applying the reducer
function.

**Description**

The `groupByManyReduce` function takes a set of elements of type `T` and groups
them based on multiple keys, defined by the `keys` function. The function then
applies a reducer function to each group to calculate an accumulated value. The
initial accumulated value is defined by the `initial` function. The function
returns a higher-order function that takes an array of elements and returns a
record object where the keys are the group keys and the values are the
accumulated values.

**Example**

```typescript
interface Person {
  name: string;
  city: string;
  age: number;
}

const people: Person[] = [
  { name: "Alice", city: "New York", age: 25 },
  { name: "Bob", city: "London", age: 30 },
  { name: "Charlie", city: "New York", age: 40 },
  { name: "Alice", city: "London", age: 20 },
];

const keySelector = (person: Person) => [person.city];
const ageSumReducer = (sum: number, person: Person) => sum + person.age;
const initialSum = () => 0;

const groupByCitySumAge = groupByManyReduce(
  keySelector,
  ageSumReducer,
  initialSum,
);
const result = groupByCitySumAge(people);

console.log(result);
// Output: { "New York": 65, "London": 50 }
```

In the example above, the `groupByManyReduce` function is used to group people
by their cities and calculate the sum of their ages using the `ageSumReducer`
function. The result is a record object where the keys are the cities and the
values are the sums of ages for each city.

### groupByReduce

```typescript
groupByReduce<T, S, K extends Primitive>(
  key: (_: T) => K,
  reducer: Reducer<T, S>,
  initial: () => S,
): (_: T[]) => Record<K, S>
```

This function takes in three parameters: `key`, `reducer`, and `initial`. It
returns a new function that takes in an array of type `T` and returns a record
where the keys are of type `K` and the values are of type `S`.

The `key` parameter is a function that takes in an element of type `T` and
returns its key of type `K`. The `reducer` parameter is a function that takes in
an element of type `T` and an accumulator of type `S`, and returns the updated
accumulator value. The `initial` parameter is a function that returns the
initial value of the accumulator.

Here's an example usage:

```typescript
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Alice", age: 35 },
];

const sumReducer = (acc: number, person: { age: number }) => acc + person.age;

const groupByAgeSum = groupByReduce(
  (person) => person.age,
  sumReducer,
  () => 0,
);

const result = groupByAgeSum(people);
console.log(result);
// Output: { 25: 25, 30: 30, 35: 35 }
```

In this example, we have an array of people where each person has a name and an
age. We define a reducer function `sumReducer` that takes in an accumulator and
a person object, and updates the accumulator by adding the person's age. We then
use `groupByReduce` to create a new function `groupByAgeSum` that groups the
people by their age and calculates the sum of their ages using the `sumReducer`.
We call `groupByAgeSum` with the `people` array to get the result, which is a
record where the keys are the ages and the values are the sums of the ages. The
output is `{ 25: 25, 30: 30, 35: 35 }`.

### `groupByMany`

```typescript
groupByMany<T, K extends Primitive>(keys: (_: T) => K[]) => (it: T[]) => Record<K, any[]>
```

This function takes in an array of items (`it`) and a function (`keys`) that
maps each item to an array of keys (`K`). It returns a function that groups the
items by the keys.

#### Parameters

- `keys: (_: T) => K[]`: A function that maps each item to an array of keys.

#### Return Type

`(it: T[]) => Record<K, any[]>`: A function that takes in an array of items
(`it`) and returns an object where the keys are the distinct keys from the
`keys` function and the values are arrays of items that share the same keys.

#### Example

```typescript
const items = [
  { id: 1, category: "A", color: "red" },
  { id: 2, category: "A", color: "blue" },
  { id: 3, category: "B", color: "red" },
  { id: 4, category: "B", color: "blue" },
];

const groupByCategoryAndColor = groupByMany((
  item,
) => [item.category, item.color]);

const groupedItems = groupByCategoryAndColor(items);
/*
{
  'A': [
    { id: 1, category: 'A', color: 'red' },
    { id: 2, category: 'A', color: 'blue' },
  ],
  'B': [
    { id: 3, category: 'B', color: 'red' },
    { id: 4, category: 'B', color: 'blue' },
  ],
}
*/
```

In the example above, `groupByCategoryAndColor` is a function that groups the
`items` array by category and color. The resulting `groupedItems` object
contains arrays of items that share the same category and color.

### `addEntry`

#### Signature

```typescript
(<Object, Value>(key: Primitive, value: Value) => (obj: Object) => ({
  ...obj,
  [key]: value,
}));
```

#### Description

The `addEntry` function is a higher-order function that takes a key and a value,
and returns a new function that takes an object as input. The returned function
adds a new key-value pair to the input object and returns a new object with the
added entry.

#### Example

```javascript
const obj = { name: "John", age: 30 };
const addEntry = (key, value) => (obj) => ({ ...obj, [key]: value });

const newObj = addEntry("email", "john@example.com")(obj);
console.log(newObj);
// Output: { name: 'John', age: 30, email: 'john@example.com' }
```

In the example above, the `addEntry` function is used to add an 'email' key with
the value 'john@example.com' to the `obj` object. The resulting object `newObj`
now contains the added entry.

### groupBy

```typescript
groupBy<T, K extends Primitive>(f: Unary<T, K>): (it: T[]) => Record<K, any[]>
```

The `groupBy` function takes a unary function `f` and returns a new function
that accepts an array (`T[]`). It groups the elements of the array based on the
result of applying `f` to each element. The grouping result is returned as an
object with keys of type `K` and values as arrays of any type (`any[]`).

#### Example

```typescript
const data = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

const groupByFirstChar = groupBy((item) => item.name.charAt(0));

console.log(groupByFirstChar(data));
// Output: { A: [{ id: 1, name: 'Alice' }], B: [{ id: 2, name: 'Bob' }], C: [{ id: 3, name: 'Charlie' }] }
```

In the example above, we have an array of objects, and we want to group them by
the first character of the `name` property. The `groupBy` function allows us to
achieve this by providing a unary function that extracts the first character of
the `name` property. The result is an object with keys representing the first
character of each name and values as arrays containing the corresponding
objects.

### edgesToGraph

```typescript
edgesToGraph<Node, Edge extends [Node, Node]>(s: Set<Node>, [_, destination]: Edge): Set<Node>
```

Description:

This function takes a set of nodes `s` and an edge `[_, destination]`, and adds
the destination node to the set. It then returns the updated set.

Example

```typescript
const nodes = new Set<string>(["A", "B", "C"]);
const edge = ["B", "C"];

const updatedNodes = edgesToGraph(nodes, edge);
console.log(updatedNodes); // Output: Set(["A", "B", "C", "C"])
```

In this example, the function adds the destination node "C" to the set of nodes,
resulting in an updated set containing `"A", "B", "C", "C"`.

### entryFilter

```typescript
entryFilter(f: Function): (Obj: Record<ParamOf<Function>[0], ParamOf<Function>[1]>) => ((_: ParamOf<Function>[]) => Function extends AsyncFunction ? Promise<ParamOf<Function>[]> : ParamOf<Function>[])
```

This function takes a filter function `f` as input and returns a higher-order
function that filters the entries of an object.

- `f`: A function that takes a key-value pair (`kv`) and returns a boolean or a
  promise that resolves to a boolean.

Example

```typescript
const obj = { a: 1, b: 2, c: 3 };

const filterFn = (kv: [string, number]) => kv[1] > 1;

const filteredEntries = entryFilter(filterFn)(obj);

console.log(filteredEntries); // { b: 2, c: 3 }
```

In this example, the `filterFn` function filters the entries based on the
condition `kv[1] > 1`. The `entryFilter` function applies the filter to the
`obj` object, and the resulting filtered entries are returned.

### valFilter

```typescript
const valFilter: (f: Predicate) => (Obj: Record<any, any>) => Record<any, any>;
```

This function takes in a predicate function `f` and returns a new function that
filters object properties based on the predicate.

#### Parameters

- `f: Predicate` - A predicate function that takes in a value and returns a
  boolean.

#### Return Type

`(Obj: Record<any, any>) => Record<any, any>` - The returned function takes in
an object `Obj` and returns a new object that contains only the properties that
pass the predicate test.

#### Example

```typescript
const data = {
  name: "John",
  age: 25,
  country: "USA",
  occupation: "Developer",
};

const isString = (val: any) => typeof val === "string";
const isNumber = (val: any) => typeof val === "number";

const filterStringProps = valFilter(isString);
const filterNumberProps = valFilter(isNumber);

console.log(filterStringProps(data));
// Output: { name: 'John', country: 'USA', occupation: 'Developer' }

console.log(filterNumberProps(data));
// Output: { age: 25 }
```

In the above example, `valFilter` is used to create two filter functions
`filterStringProps` and `filterNumberProps`. `filterStringProps` filters out
properties from the `data` object that are not strings, while
`filterNumberProps` filters out properties that are not numbers.

### keyFilter

```typescript
((keyFilter: Function) => (obj: Record<any, any>) => Record<any, any>);
```

The `keyFilter` function is a higher-order function that takes a filtering
function as an argument and returns a new function that applies the filter to
the keys of an object. The returned function takes an object as its argument and
returns a new object with only the keys that pass the filter.

#### Example

```typescript
const obj = {
  name: "John",
  age: 25,
  city: "New York",
};

const filterFn = (key: string) => key.startsWith("a");

const filteredObj = keyFilter(filterFn)(obj);

console.log(filteredObj);
// Output: { age: 25 }
```

In the above example, the `keyFilter` function is used with a filtering function
that checks if a key starts with the letter 'a'. The resulting function is then
applied to an object, and only the key 'age' passes the filter. Therefore, the
resulting object only contains the 'age' key.

### valMap

**Signature:**
`(f: (v: OldValue) => NewValue) => (Obj: Record<any, any>) => Record<any, any>`

valMap is a higher-order function that takes a mapping function `f` and returns
a new function that applies `f` to all values in an object.

**Example**

```typescript
const double = (x: number) => x * 2;
const doubleValues = valMap(double);
console.log(doubleValues({ a: 1, b: 2, c: 3 })); // Output: { a: 2, b: 4, c: 6 }
```

In the example above, `valMap` is used to create a new function `doubleValues`,
which doubles all values in an object when called with an object
`{ a: 1, b: 2, c: 3 }`. The resulting object is then printed to the console.

### keyMap

```typescript
(keyMap: (f: (v: OldKey) => NewKey) => (_: Record<OldKey, unknown>) => Record<NewKey, unknown>
```

The `keyMap` function takes a mapping function `f` that maps an old key `OldKey`
to a new key `NewKey`. It returns a new function that takes a record of values
with old keys and returns a new record with the mapped keys.

#### Example

```typescript
const oldRecord = {
  A: 1,
  B: 2,
  C: 3,
};

const mappingFunction = (v: string) => v.toLowerCase();

const newRecord = keyMap(mappingFunction)(oldRecord);

console.log(newRecord);
// Output: {
//   a: 1,
//   b: 2,
//   c: 3,
// }
```

In the above example, the `keyMap` function is used to map the keys of
`oldRecord` to lowercase keys using the `mappingFunction`. The resulting
`newRecord` has the updated keys.

### mapTerminals

`(terminalMapper: (_: Terminal) => unknown) => (obj: Tree<Terminal>) => Tree<unknown>`

This function takes in a `terminalMapper` function which is applied to all
terminal values in a `Tree` object. It returns a new `Tree` object where the
terminal values have been transformed by the `terminalMapper` function.

#### Parameters

- `terminalMapper: (_: Terminal) => unknown` - A function that takes a terminal
  value of type `Terminal` and returns a value of type `unknown`.

#### Return Type

`(obj: Tree<Terminal>) => Tree<unknown>`

#### Example

```typescript
import { mapTerminals } from "your-library";

const tree = {
  asdf: "hello",
  qwer: ["one", "two", "three"],
  zxcv: 123,
};

const mapper = (val: string | number) => {
  if (typeof val === "number") {
    return val * 2;
  } else {
    return val.toUpperCase();
  }
};

const transformedTree = mapTerminals(mapper)(tree);

console.log(transformedTree);
/*
{
  asdf: "HELLO",
  qwer: ["ONE", "TWO", "THREE"],
  zxcv: 246,
}
*/
```

In this example, the `mapTerminals` function is used to transform the terminal
values of the `tree` object. The `mapper` function converts strings to uppercase
and multiplies numbers by 2. The resulting `transformedTree` object reflects
these transformations.

### applySpec

```typescript
applySpec<Args extends unknown[]>(spec: Tree<(..._: Args) => unknown>): (...args: Args) => unknown
```

The `applySpec` function takes a `spec` argument which is a tree structure
representing a set of functions, and returns a new function that applies the
provided arguments to the functions in the spec.

#### Example

```typescript
const spec = {
  sum: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b,
};

const applyArgs = applySpec(spec);

console.log(applyArgs(2, 3)); // Output: { sum: 5, multiply: 6 }
```

In the example above, we have a `spec` object with two functions: `sum` and
`multiply`. The `applySpec` function takes this `spec` and returns a new
function `applyArgs` that applies the provided arguments `(2, 3)` to the
functions in the `spec`. The output is an object with the results of applying
the arguments to each function.

### `sum()`

**Signature:** `() => number`

The `sum()` function returns the sum of zero. It does not take any parameters.

**Example**

```javascript
sum(); // returns 0
```

### `divide(x: number): (y: number) => number`

This function takes a number `x` and returns a function that when called with
another number `y`, divides `y` by `x` and returns the result.

#### Example

```javascript
const divideBy2 = divide(2);
const result = divideBy2(10); // result = 5
```

In the example above, `divideBy2` is a function that divides any number by 2.
When we call `divideBy2(10)`, it returns the result of dividing 10 by 2, which
is 5.

### times

```typescript
times(x: number): (y: number) => number
```

Returns a function that multiplies a given number `y` by the input `x`.

#### Example

```typescript
const multiplyByTwo = times(2); // returns a function that multiplies a number by 2

console.log(multiplyByTwo(5)); // Output: 10
console.log(multiplyByTwo(10)); // Output: 20
```

In the example above, the `times` function is used to create a new function
`multiplyByTwo` which multiplies a given number by 2. This new function can then
be called with different values to perform the multiplication.

### average

Calculate the average of an array of numbers.

#### Signature

```typescript
((arr: number[]) => number);
```

#### Parameters

- `arr`: an array of numbers.

#### Returns

Returns the average value of the array.

#### Example

```typescript
const arr = [1, 2, 3, 4, 5];
const result = average(arr);
console.log(result); // Output: 3
```

### multiply

```typescript
multiply(x: number): (y: number) => number
```

Returns a function that multiplies a number `x` with a number `y`.

- `x`: The number to multiply with.

#### Example

```typescript
const multiplyBy2 = multiply(2);
console.log(multiplyBy2(3)); // Output: 6
console.log(multiplyBy2(4)); // Output: 8
```

The `multiplyBy2` function returned by `multiply(2)` can be used to multiply any
number with 2. In the example above, it is used to multiply `3` and `4` by `2`,
resulting in `6` and `8` respectively.

### rate

**Signature:** `(f: (x: T) => boolean) => (_: T[]) => number`

This function takes in a predicate function `f` and returns a new function that
calculates the rate at which elements in an array pass the predicate.

- `f` is a predicate function that takes an element of type `T` and returns a
  boolean value.

**Example**

```javascript
const isEven = (x) => x % 2 === 0;

const arr = [1, 2, 3, 4, 5, 6];

const rateOfEvenNumbers = rate(isEven);

console.log(rateOfEvenNumbers(arr)); // Output: 0.3333333333333333 (1/3)
```

In the example above, we define a predicate function `isEven` which returns
`true` if a number is even. We then create an array `arr` with numbers 1 to 6.
We use the `rate` function to create a new function `rateOfEvenNumbers` by
passing in `isEven`. Finally, we call `rateOfEvenNumbers` passing in `arr` and
get the rate at which the numbers in the array are even, which is `1/3` or
`0.3333333333333333`

### repeat

```typescript
repeat<T>(element: T, times: number): any[]
```

This function takes an element and a number of times to repeat that element, and
returns an array containing the repeated elements.

##### Parameters:

- `element: T`: The element to be repeated.
- `times: number`: The number of times to repeat the element.

##### Return Type:

- `any[]`: An array containing the repeated elements.

##### Example

```typescript
repeat("hello", 3);
// Output: ['hello', 'hello', 'hello']
```

### product

```typescript
product(a: unknown[], b: unknown): any
```

The `product` function takes two arrays `a` and `b` as parameters and returns a
new array that represents the Cartesian product of `a` and `b`.

#### Parameters

- `a` (type: unknown[]): The first array.
- `b` (type: unknown): The second value.

#### Return Value

- The Cartesian product of `a` and `b`. The return value's type is `any`, as it
  depends on the input types.

#### Example

```typescript
const a = [1, 2, 3];
const b = ["a", "b"];
const result = product(a, b);
console.log(result);
// Output: [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b'], [3, 'a'], [3, 'b']]
```

In this example, the function `product` is called with the arrays `a` and `b`.
The resulting array contains all possible combinations of elements from `a` and
`b` in a nested array format.

### explode

```typescript
explode(...positions: number[]): (xs: any[]) => any
```

The `explode` function takes in a list of positions and returns a new function
that accepts an array of values. It extracts the values at the given positions
from the input array and returns them as an array.

#### Example

```typescript
const input = [1, 2, 3, 4, 5];
const getValues = explode(1, 3);

console.log(getValues(input));
// Output: [2, 4]
```

In the above example, the `explode` function is first called with positions 1
and 3. It then returns a new function `getValues` that can be used to extract
the values at those positions from an input array. When `getValues` is called
with the `input` array, it returns `[2, 4]` which are the values at positions 1
and 3 in the input array.

### letIn

```typescript
letIn<T, Output>(value: T, constructor: (input: T) => Output): Output
```

The `letIn` function takes a value `value` of type `T` and a constructor
function `constructor` that takes `value` as input and returns an `Output`
value. It applies the constructor function to the value and returns the result.

#### Example

```typescript
const length = letIn("hello", (str) => str.length);
console.log(length); // Output: 5
```

In the example above, the `letIn` function is used to apply the constructor
function `(input: string) => string.length` to the value `'hello'`. The
constructor function calculates the length of the input string, and the `letIn`
function returns the result, which is `5`.

### `not(x: any): boolean`

This function takes an argument `x` of any type and returns the negation of `x`
as a boolean value.

#### Example

```javascript
not(false); // true
not(true); // false
not(0); // true
not(5); // false
not(""); // true
not("hello"); // false
```

In the above example, the `not` function is called with various arguments to
demonstrate its behavior.

### prop

```typescript
prop:
(<T>() => <K extends keyof T>(key: K) => (x: T) => T[K]);
```

Returns a function that takes an object (`x`) of type `T` and returns the value
of the property with key `K`.

#### Parameters

This function does not take any parameters.

#### Return Type

- `<K extends keyof T>(key: K) => (x: T) => T[K]`: A function that accepts an
  object `x` of type `T` and returns the value of the property with key `K` on
  `x`.

#### Example

```typescript
interface Person {
  name: string;
  age: number;
}

const getName = prop<Person>()("name");
const person: Person = { name: "John", age: 25 };

console.log(getName(person)); // Output: "John"
```

In the above example, we define an interface `Person` with `name` and `age`
properties. We then create a function `getName` using the `prop` function.
`getName` can be used to get the value of the `name` property from a `Person`
object. We pass `person` to `getName` and it returns the value `"John"`.

### equals

The `equals` function takes in two values and returns a function that checks if
the values are equal.

#### Signature

```typescript
equals(x: Primitive): (y: Primitive) => boolean
```

#### Parameters

- `x`: A value of type `Primitive`.

#### Return Type

`(y: Primitive) => boolean`: A function that takes in a value of type
`Primitive` and returns a boolean indicating whether the two values are equal.

#### Example

```typescript
const equalsStrings = equals("hello");

console.log(equalsStrings("hello")); // Output: true
console.log(equalsStrings("world")); // Output: false
```

### `greater(x: number): (y: number) => boolean`

This function takes a number `x` and returns a function that takes a number `y`
and determines if `y` is greater than `x`.

#### Example

```javascript
const isGreaterThan10 = greater(10);
console.log(isGreaterThan10(15)); // true
console.log(isGreaterThan10(5)); // false
```

In the example above, we first create a function `isGreaterThan10` using
`greater(10)`. This function will check if a number is greater than 10. We then
use `isGreaterThan10` to compare `15` and `5` with `10`, resulting in `true` and
`false` respectively.

### smaller(x)

This function takes a number `x` and returns a new function that takes a number
`y` and returns a boolean value indicating whether `y` is smaller than `x`.

#### Example

```javascript
const isSmallerThan5 = smaller(5);
console.log(isSmallerThan5(3)); // Output: true
console.log(isSmallerThan5(7)); // Output: false
```

### greaterEquals

```typescript
greaterEquals(x: number): (y: number) => boolean
```

This function takes a number `x` and returns a new function that takes a number
`y` and checks if `y` is greater than or equal to `x`. It returns `true` if `y`
is greater than or equal to `x`, otherwise it returns `false`.

#### Example

```typescript
const checkGreaterOrEqual = greaterEquals(5);
console.log(checkGreaterOrEqual(7)); // Output: true
console.log(checkGreaterOrEqual(3)); // Output: false
```

### smallerEquals

**Signature:** smallerEquals(x: number) => (y: number) => boolean

Returns a curried function that takes a number `y` and returns true if `y` is
smaller than or equal to `x`, otherwise returns false.

#### Parameters

- `x` : number - The reference number to compare against.

#### Return type

- `(y: number) => boolean` - A curried function that accepts a number `y` and
  returns a boolean value based on the comparison against the reference number
  `x`.

#### Example

```typescript
const smallerOrEqual = smallerEquals(5);
console.log(smallerOrEqual(3)); // true
console.log(smallerOrEqual(7)); // false
```

In this example, we define a reference number `5` and create a curried function
`smallerOrEqual` using the `smallerEquals` function. When we call
`smallerOrEqual` with other numbers, it compares each number with the reference
number `5` and returns whether it is smaller than or equal to it. So, in the
example, `smallerOrEqual(3)` returns `true` while `smallerOrEqual(7)` returns
`false`.

### between

```typescript
((start: number, end: number) => (x: number) => boolean);
```

Returns a function that checks if a given number `x` is between `start`
(inclusive) and `end` (exclusive).

#### Example

```typescript
const isBetweenOneAndTen = between(1, 10);
console.log(isBetweenOneAndTen(5)); // true
console.log(isBetweenOneAndTen(10)); // false
console.log(isBetweenOneAndTen(0)); // false
```

In this example, we create a function `isBetweenOneAndTen` using the `between`
function. This function checks if a given number is between 1 (inclusive) and 10
(exclusive). The function returns `true` if the number is between 1 and 10, and
`false` otherwise.

### unspread

```typescript
unspread<Inputs extends any[]>(...stuff: Inputs): Inputs
```

The `unspread` function takes in a list of values and returns them as an array.

#### Example

```typescript
const result = unspread(1, 2, 3);

console.log(result);
// Output: [1, 2, 3]
```

In this example, the function `unspread` is called with values `1`, `2`, and
`3`. The function returns an array `[1, 2, 3]`, which is then printed to the
console.

### spread

```typescript
spread<F extends Func>(f: F): (x: Parameters<F>) => ReturnType<F>
```

The `spread` function takes a function `f` as input and returns a new function
that spreads the arguments when called. It has the following signature:

- `F`: a generic type parameter representing the input function type.

The return type of `spread` is a new function that takes the arguments of `f` as
individual parameters and returns the result of calling `f` with those spread
arguments. The return type of this new function is the same as the return type
of `f`.

#### Example

```typescript
const sum = (x: number, y: number): number => {
  return x + y;
};

const spreadSum = spread(sum);

console.log(spreadSum([1, 2])); // Output: 3
```

In the example above, we have a `sum` function that takes two arguments and
returns their sum. We then use `spread` to create a new function `spreadSum`
that spreads the arguments when called. We pass an array `[1, 2]` to `spreadSum`
instead of two separate arguments, and it correctly calculates the sum and
returns the result of `3`.

### modulo

```typescript
((y: number) => (x: number) => x % y);
```

This function takes a number `y` and returns a new function that takes another
number `x` and calculates the remainder of `x` divided by `y`.

#### Parameters

- `y: number`: The divisor.

#### Returns

- `(x: number) => number`: A function that takes a number `x` and returns the
  remainder of `x` divided by `y`.

#### Example

```typescript
const modBy2 = modulo(2);
console.log(modBy2(5)); // Output: 1
console.log(modBy2(8)); // Output: 0
console.log(modBy2(10)); // Output: 0
```

### promiseAll

```typescript
promiseAll(promises: Promise<unknown>[]): Promise<any>
```

The `promiseAll` function takes in an array of promises and returns a new
promise that is fulfilled when all the input promises are fulfilled, or rejected
if any of the input promises are rejected.

#### Example

```typescript
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
];

promiseAll(promises)
  .then((result) => console.log(result)) // Output: [1, 2, 3]
  .catch((error) => console.error(error));
```

In the example above, an array of promises is created, each resolving with a
different value. The `promiseAll` function is called with the array of promises
and a new promise is returned. When all the input promises are fulfilled, the
`then` callback is executed with an array of the resolved values. Otherwise, if
any of the input promises are rejected, the `catch` callback is executed with
the reason of the first rejected promise.

### wrapPromise

```typescript
wrapPromise<T>(x: T): Promise<T>
```

This function takes a value `x` and wraps it in a Promise. The function returns
the wrapped value as a Promise.

#### Example

```typescript
const value = 10;
const wrappedValue = wrapPromise(value);

console.log(wrappedValue);
// Output: Promise { 10 }
```

In the example above, the function `wrapPromise` is called with the value `10`.
The function wraps the value in a Promise and returns it. The console output
shows that the value `10` is wrapped in a Promise object.

### isPromise

Checks if a value is a Promise.

#### Signature

`isPromise(x: any): boolean`

#### Parameters

`x`: any - The value to be checked.

#### Returns

`boolean` - True if the value is a Promise, false otherwise.

#### Example

```javascript
const promise = new Promise((resolve, reject) => {
  // some async operation
});

const result1 = isPromise(promise); // true

const result2 = isPromise(42); // false
```

### `doInSequence`

`doInSequence` is a function that executes a series of functions in sequence,
where each function is a nullary function (a function with no arguments). It
returns a `Promise` that resolves to `void`.

#### Signature

```typescript
((
  head: NullaryFunction,
  ...rest: NullaryFunction[]
) => Promise<void>);
```

#### Parameters

- `head: NullaryFunction`: The first function to execute in the sequence.
- `...rest: NullaryFunction[]`: The remaining functions to execute in the
  sequence.

#### Return Type

- `Promise<void>`: A `Promise` that resolves to `void` when all the functions in
  the sequence have been executed.

#### Example

```javascript
const func1 = () => {
  // Do some async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Function 1 executed.");
      resolve();
    }, 1000);
  });
};

const func2 = () => {
  // Do some async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Function 2 executed.");
      resolve();
    }, 2000);
  });
};

doInSequence(func1, func2);
```

In the above example, `doInSequence` is used to execute `func1` and `func2` in
sequence. Each function is an async operation inside a `Promise`. The output of
the example will be:

```
Function 1 executed.
Function 2 executed.
```

Note that the exact timings may vary based on the machine's processing power and
other factors.

### reduce

**Signature**

```typescript
reduce(reducer: Function, initial: () => Awaited<ReturnType<Function>>): (xs: Parameters<Function>[1][]) => ReturnType<Function>
```

Applies a reducer function to an array of elements, returning a single
accumulated value.

**Parameters**

- `reducer: Function`: A function that takes a state and an element, and returns
  an updated state.
- `initial: () => Awaited<ReturnType<Function>>`: A function that returns the
  initial state.

**Returns**

- `(xs: Parameters<Function>[1][]) => ReturnType<Function>`: A function that
  takes an array of elements and applies the reducer to return an accumulated
  value.

**Example**

```typescript
const sumReducer = (sum: number, num: number) => sum + num;
const initialValues = () => 0;
const numbers = [1, 2, 3, 4, 5];
const total = reduce(sumReducer, initialValues)(numbers);
console.log(total); // Output: 15
```

In this example, the `reduce` function is used to calculate the sum of all the
numbers in the `numbers` array. The `sumReducer` function takes a state (`sum`)
and an element (`num`), and returns the updated state by adding the element to
the sum. The `initialValues` function returns the initial state, which is 0.
Finally, the `reduce` function is applied to the `numbers` array to calculate
the total sum, which is 15.

### min

```typescript
((key: (x: T) => number | Promise<number>) => (xs: T[]) => T);
```

The `min` function takes a `key` function which returns a number or a promise of
a number for each element in an array `xs`. It returns a function that finds the
element in `xs` that has the minimum value according to the `key` function.

#### Example

```typescript
const numbers = [4, 2, 6, 1, 3];
const getKey = (x: number) => x;
const findMin = min(getKey);

console.log(findMin(numbers)); // Output: 1
```

In the example above, we have an array of numbers `numbers`. We define a
`getKey` function which simply returns each number as the key. We then use the
`min` function to create a `findMin` function that finds the minimum number in
`numbers` according to the `getKey` function. Finally, we call
`findMin(numbers)` to get the minimum number in the array.

### max

`(key: (x: T) => number | Promise<number>) => (xs: T[]) => T`

Function to find the maximum element in an array based on a key function.

#### Parameters:

- `key: (x: T) => number | Promise<number>`: A function that computes a
  numerical key for each element `x` in the array `xs`.

#### Returns:

- `(xs: T[]) => T`: A function that takes an array `xs` of type `T` and return
  the maximum element based on the key function.

#### Example

```javascript
const data = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  { name: "Michael", age: 20 },
];

const maxAge = max((person) => person.age);
const oldestPerson = maxAge(data);

console.log(oldestPerson); // { name: 'Jane', age: 30 }
```

In the example above, we have an array of objects representing people. The
`maxAge` function is created by calling `max` with a key function that returns
the age of each person. The `maxAge` function is then used to find the oldest
person in the `data` array. The result, `{ name: 'Jane', age: 30 }`, is printed
to the console.

### truncate

`(maxLength: number) => (input: string) => string`

The `truncate` function takes in a `maxLength` parameter and returns a new
function that takes a `input` parameter. It truncates the input string to the
specified maximum length and adds ellipsis (...) if the string is longer than
the maximum length.

#### Parameters

- `maxLength: number`: The maximum length of the string before truncation.

#### Return Type

`(input: string) => string`: The truncated string.

#### Example

```typescript
const truncateWithMaxLength10 = truncate(10);
console.log(truncateWithMaxLength10("Hello, world!")); // Output: "Hello, wor..."

const truncateWithMaxLength5 = truncate(5);
console.log(truncateWithMaxLength5("Hello")); // Output: "Hello"
```

### split

- Signature: `split(x: string | RegExp): (s: string) => string[]`

Splits a string into an array of substrings based on a specified delimiter.

#### Parameters:

- `x: string | RegExp` - The delimiter used to split the string. It can be a
  string or a regular expression.

#### Returns:

- `(s: string) => string[]` - A function that takes a string `s` and returns an
  array of substrings.

#### Example

```javascript
const splitByComma = split(",");

console.log(splitByComma("apple,banana,orange"));
// Output: ['apple', 'banana', 'orange']
```

### `uppercase(s: string): string`

This function takes a string as input and returns a new string with all the
characters converted to uppercase.

#### Example

```typescript
const result = uppercase("hello world");
console.log(result); // Output: "HELLO WORLD"
```

In the above example, the function is called with the string "hello world" as an
argument. The function returns a new string with all the characters converted to
uppercase, resulting in "HELLO WORLD".

### lowercase

```typescript
lowercase(s: string): string
```

The `lowercase` function takes a string as input and returns a new string with
all characters converted to lowercase using the `toLocaleLowerCase` method.

#### Example

```typescript
const input = "Hello, World!";
const result = lowercase(input);
console.log(result); // Output: "hello, world!"
```

In the example above, the `lowercase` function is called with the string
`"Hello, World!"`. The function converts all characters to lowercase and returns
the string `"hello, world!"`. The result is then logged to the console.

### replace

**Signature:**
`(target: string | RegExp, replacement: string) => (s: string) => string`

The `replace` function takes in two parameters: `target` and `replacement`. The
`target` parameter can be either a string or a regular expression, and the
`replacement` parameter is a string. It returns a new function that takes in a
string `s` and returns a new string with all occurrences of `target` replaced by
`replacement`.

**Example**

```typescript
const replaceHello = replace("hello", "hi");
const result = replaceHello("hello world");

console.log(result); // Output: "hi world"
```

### capitalize

**Signature:** `(s: string) => string`

The `capitalize` function takes a string as input and returns a new string where
the first character is capitalized and the rest of the characters remain
unchanged.

**Example**

```typescript
capitalize("hello"); // returns "Hello"
capitalize("WORLD"); // returns "WORLD"
capitalize("123"); // returns "123"
```

In this example, the function takes the input string "hello" and returns
"Hello", where the first letter "h" is capitalized. The same process is applied
to the other input strings.

### trim

`(characters: string[]) => (str: string) => string`

This function trims characters from the beginning and end of a string.

#### Parameters

- `characters: string[]` - An array of characters to be trimmed from the string.

#### Returns

`(str: string) => string` - A function that takes a string as input and returns
the trimmed string.

#### Example

```javascript
const trimWhitespaces = trim([" ", "\t"]);
const result = trimWhitespaces("  Hello World!  ");
console.log(result); // Output: 'Hello World!'
```

### testRegExp

```typescript
((regexp: RegExp) => (x: string) => regexp.test(x));
```

This function takes a regular expression `regexp` as a parameter and returns a
new function that takes a string `x` as a parameter and applies the regular
expression test on `x` using `regexp.test(x)`.

#### Example

```typescript
const testEmail = testRegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

console.log(testEmail("test@example.com")); // Output: true
console.log(testEmail("invalid_email")); // Output: false
```

### `isValidRegExp`

Checks if a given string is a valid regular expression.

#### Signature

```typescript
((str: string) => boolean);
```

#### Parameters

- `str` : string - The string to check if it is a valid regular expression.

#### Returns

boolean - Returns `true` if the string is a valid regular expression, otherwise
`false`.

#### Example

```typescript
isValidRegExp("abc"); // true
isValidRegExp("[a-z]+"); // true
isValidRegExp("(\\d{3})-\\d{3}-\\d{4}"); // true
isValidRegExp("(abc"); // false
isValidRegExp("[a-z]+\\"); // false
isValidRegExp("[a-z]{}"); // false
```

### wrapString

```typescript
((wrapping: string) => (inner: string) => string);
```

The `wrapString` function takes a `wrapping` string as an argument and returns a
new function that can be used to wrap another string (`inner`) within the
`wrapping` string.

#### Parameters

- `wrapping` (string): The wrapping string used to wrap the `inner` string.

#### Returns

`(inner: string) => string`: A function that takes an `inner` string and returns
the wrapped string.

#### Example

```typescript
const wrapWithBrackets = wrapString("[]");
const wrappedString = wrapWithBrackets("Hello");
console.log(wrappedString); // Output: "[Hello]"
```

In the above example, the `wrapString` function is used to create a new function
`wrapWithBrackets` that wraps a string with square brackets "[" and "]". Then,
the `wrapWithBrackets` function is used to wrap the string "Hello" and the
resulting wrapped string "[Hello]" is printed to the console.

### addDays

```typescript
addDays(millisTimestamp: number, days: number): Date
```

This function takes a millisecond timestamp and a number of days and returns a
new date that is the number of days after the specified timestamp.

#### Example

```typescript
const timestamp = 1639852800000; // 2021-12-19 00:00:00 UTC
const daysToAdd = 7;

const result = addDays(timestamp, daysToAdd);
console.log(result); // Output: "2021-12-26T00:00:00.000Z"
```

In the above example, `addDays` is called with a millisecond timestamp of
"1639852800000" representing December 19, 2021, and `daysToAdd` value of 7. The
function returns a new date that is 7 days after the specified timestamp, which
is "2021-12-26T00:00:00.000Z".

### lastNDays

```typescript
lastNDays(n: number): (number | Date)[]
```

Returns an array of the last `n` days, including today.

#### Parameters

- `n`: A number representing the number of days to retrieve.

#### Returns

An array of `number` or `Date` objects representing the last `n` days.

#### Example

```typescript
const lastSevenDays = lastNDays(7);
console.log(lastSevenDays);
// Output: [date1, date2, date3, date4, date5, date6, date7]

const lastTwoDays = lastNDays(2);
console.log(lastTwoDays);
// Output: [date1, date2]
```

In the example above, the `lastNDays` function is called with different values
for the parameter `n`. The function returns an array containing the
corresponding number of dates representing the last `n` days.

### sleep(milliseconds: number): Promise<any>

This function returns a Promise that resolves after the specified number of
milliseconds.

#### Parameters

- `milliseconds: number` - The number of milliseconds to sleep.

#### Example

```javascript
await sleep(1000);
console.log("After 1 second");
```

In the example above, the function `sleep` is called with `1000` as the
argument, which represents 1 second. The code then waits for 1 second before
logging "After 1 second" to the console.

### reduceTree(getChildren, reduce)

Creates a function that recursively reduces a tree structure using a given
`getChildren` function to obtain the children of each node and a `reduce`
function to combine the current node with its children.

#### Signature

```typescript
reduceTree(getChildren: (tree: Tree) => Tree[], reduce: (current: Tree, children: R[]) => R): (tree: Tree) => R
```

#### Parameters

- `getChildren`: A function that takes a `tree` and returns an array of its
  children.
- `reduce`: A function that takes the current `tree` and an array of reduced
  children and returns the reduced value.

#### Return Value

A function that takes a `tree` and returns the reduced value.

#### Example

```typescript
const tree = {
  value: 1,
  children: [{
    value: 2,
    children: [{
      value: 3,
      children: [],
    }],
  }, {
    value: 4,
    children: [],
  }],
};

const getChildren = (tree) => tree.children;
const reduce = (current, children) => ({
  value: current.value + children.reduce((acc, child) => acc + child.value, 0),
  children: [],
});

const sum = reduceTree(getChildren, reduce)(tree);
console.log(sum); // Output: { value: 10, children: [] }
```
