import { map } from "./map.js";

export const reduceTree = (getChildren, reduce) => (tree) =>
  reduce(tree, map(reduceTree(getChildren, reduce))(getChildren(tree)));
