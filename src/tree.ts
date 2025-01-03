import { map } from "./map.ts";

export const reduceTree = <Tree, R>(
  getChildren: (tree: Tree) => Tree[],
  reduce: (current: Tree, children: R[]) => R,
) =>
(tree: Tree): R =>
  reduce(
    tree,
    map(reduceTree(getChildren, reduce))(getChildren(tree)) as R[],
  );

export const findInTree =
  <T>(predicate: (t: T) => boolean, children: (t: T) => T[]) =>
  (t: T): null | T => {
    if (predicate(t)) return t;
    for (const child of children(t)) {
      const result = findInTree(predicate, children)(child);
      if (result) return result;
    }
    return null;
  };

export const findInTreeExhaustive =
  <T>(predicate: (t: T) => boolean, children: (t: T) => T[]) => (t: T): T[] => {
    const results = (predicate(t)) ? [t] : [];
    for (const child of children(t)) {
      results.push(...findInTreeExhaustive(predicate, children)(child));
    }
    return results;
  };
