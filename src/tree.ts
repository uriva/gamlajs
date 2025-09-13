import { map } from "./map.ts";

/**
 * Fold a tree by reducing each node with the results of its children.
 * @example
 * // Sum values in a tree
 * reduceTree((n)=>n.children, (n, kids)=> n.value + kids.reduce((a,b)=>a+b,0))(root)
 */
export const reduceTree = <Tree, R>(
  getChildren: (tree: Tree) => Tree[],
  reduce: (current: Tree, children: R[]) => R,
) =>
(tree: Tree): R =>
  reduce(
    tree,
    map(reduceTree(getChildren, reduce))(getChildren(tree)) as R[],
  );

/** Depth-first search for a node that matches a predicate. */
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

/** Return all nodes that match a predicate using DFS. */
export const findInTreeExhaustive =
  <T>(predicate: (t: T) => boolean, children: (t: T) => T[]) => (t: T): T[] => {
    const results = (predicate(t)) ? [t] : [];
    for (const child of children(t)) {
      results.push(...findInTreeExhaustive(predicate, children)(child));
    }
    return results;
  };
