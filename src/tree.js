import { map } from "./map";

export const reduceTree = (getChildren, reduce) => (tree) =>
  reduce(tree, map(reduceTree(getChildren, reduce))(getChildren(tree)));
