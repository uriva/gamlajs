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
