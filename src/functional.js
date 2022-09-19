import {
  addIndex,
  adjust,
  apply,
  assoc,
  chain,
  complement,
  concat,
  curry,
  filter,
  flip,
  fromPairs,
  groupBy,
  identity,
  includes,
  juxt,
  keys,
  last,
  map,
  nth,
  prop,
  reduce,
  toPairs,
  uniq,
  xprod,
} from "ramda";

const isPromise = (x) => !!(typeof x === "object" && x !== null && x.then);
export const tail = (x) => x.slice(1);
export const head = (x) => x[0];
export const empty = (x) => !x.length;
const pipeStep = (fs) => (x) => pipe(...tail(fs))(head(fs)(x));
export const pipe =
  (...fs) =>
  (x) =>
    empty(fs) ? x : isPromise(x) ? x.then(pipeStep(fs)) : pipeStep(fs)(x);
export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const groupByMany = (f) =>
  pipe(
    chain(pipe((element) => [f(element), [element]], apply(xprod))),
    edgesToGraph
  );

// Cannot be made point free.
export const promiseAll = (promises) => Promise.all(promises);

// Cannot be made point free.
export const wrapPromise = (x) => Promise.resolve(x);

export const asyncFirst =
  (...funcs) =>
  async (...args) => {
    const results = await pipe(
      map((f) => f(...args)),
      promiseAll,
      filter(identity)
    )(funcs);

    if (results.length) {
      return results[0];
    }
  };

export const asyncMap = curry((f, seq) => pipe(map(f), promiseAll)(seq));

export const asyncJuxt =
  (funcs) =>
  (...args) =>
    // pipe is unary so we apply.
    pipe(juxt(map(apply, funcs)), promiseAll)(args);

export const asyncFilter = (pred) =>
  pipe(
    asyncMap(async (arg) => [arg, await pred(arg)]),
    filter(last),
    map(head)
  );

export const keyMap = (fn) => pipe(toPairs, map(adjust(0, fn)), fromPairs);

export const sortAlphabetically = (array) =>
  array.sort((str1, str2) => str1.localeCompare(str2));

export const asyncReduce = (f, initial, seq) =>
  reduce(async (acc, item) => f(await acc, item), initial, seq);

// Zips arrays by the length of the first.
export const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));

const getTimestampMilliseconds = () => new Date().getTime();

export const asyncTimeit =
  (handler, f) =>
  async (...args) => {
    const started = getTimestampMilliseconds();
    const result = await f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const timeit =
  (handler, f) =>
  (...args) => {
    const started = getTimestampMilliseconds();
    const result = f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const asyncTap = (f) => async (x) => {
  await f(x);
  return x;
};

export const asyncPairRight = (f) => asyncJuxt([identity, f]);

export const asyncExcepts =
  (func, handler) =>
  async (...args) => {
    try {
      return await func(...args);
    } catch (err) {
      return handler(err);
    }
  };

export const stack = (functions) =>
  pipe(
    (values) => zip(functions, values),
    map(([f, x]) => f(x))
  );

export const asyncStack = (functions) =>
  pipe(
    (values) => zip(functions, values),
    asyncMap(([f, x]) => f(x))
  );

export const asyncIfElse =
  (predicate, fTrue, fFalse) =>
  async (...args) => {
    if (await predicate(...args)) {
      return fTrue(...args);
    }
    return fFalse(...args);
  };

export const asyncUnless = (predicate, fFalse) =>
  asyncIfElse(predicate, wrapPromise, fFalse);
export const asyncWhen = (predicate, fTrue) =>
  asyncIfElse(predicate, fTrue, wrapPromise);

export const after = (f1) => (f2) => pipe(f2, f1);
export const before = (f1) => (f2) => pipe(f1, f2);
export const juxtCat = pipe(asyncJuxt, after(reduce(concat, [])));
export const mapCat = pipe(asyncMap, after(reduce(concat, [])));
export const contains = flip(includes);

export const testRegExp = (regexp) => (x) => regexp.test(x);

export const isValidRegExp = (str) => {
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const asyncValMap = (f) =>
  pipe(toPairs, asyncMap(asyncStack([identity, f])), fromPairs);

// See MDN Object constructor.
const isObject = (obj) => obj === Object(obj);

export const asyncMapObjectTerminals = (terminalMapper) => (obj) => {
  if (Array.isArray(obj)) {
    return asyncMap(asyncMapObjectTerminals(terminalMapper), obj);
  }

  if (isObject(obj) && !(obj instanceof Function)) {
    return asyncValMap(asyncMapObjectTerminals(terminalMapper))(obj);
  }

  return terminalMapper(obj);
};

// This function differs from ramda's by the fact it supports variadic functions.
export const applyTo =
  (...args) =>
  (f) =>
    f(...args);

export const asyncApplySpec =
  (spec) =>
  (...args) =>
    asyncMapObjectTerminals(applyTo(...args))(spec);

export const product = reduce(
  (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
  [[]]
);

export const sideEffect = (f) => (x) => {
  f(x);
  return x;
};

export const wrapArray = (x) => [x];

export const log = sideEffect(console.log);
export const logTable = sideEffect(console.table);
export const includedIn = (stuff) => (x) => stuff.includes(x);
export const logWith = (...x) => sideEffect((y) => console.log(...x, y));
export const pack = (...stuff) => stuff;

export const remove = pipe(complement, (f) => (arr) => arr.filter(f));

export const explode = (...positions) =>
  pipe(
    addIndex(map)((x, i) =>
      complement(includedIn(positions))(i) ? wrapArray(x) : x
    ),
    product
  );

export const anymap = (f) => (arr) => arr.some(f);
export const allmap = (f) => (arr) => arr.every(f);
export const count = prop("length");
export const mapcat = (f) => pipe(map(f), reduce(concat, []));
export const rate = (f) =>
  pipe(juxt([pipe(filter(f), count), count]), ([x, y]) => x / y);

export const countTo = (x) => {
  const result = [];
  for (let i = 0; i < x; i++) result.push(i);
  return result;
};

export const valmap = (f) => (o) =>
  Object.fromEntries(Object.entries(o).map(([x, y]) => [x, f(y)]));

export const between =
  ([start, end]) =>
  (x) =>
    start <= x && x < end;

export const renameKeys = curry((keysMap, obj) =>
  reduce(
    (acc, key) => assoc(prop(key, keysMap) || key, prop(key, obj), acc),
    {},
    keys(obj)
  )
);
