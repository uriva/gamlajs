const { map } = require("ramda");

export const reduceTree = (getChildren, reduce) => (tree) =>
  reduce(tree, map(reduceTree(getChildren, reduce), getChildren(tree)));
