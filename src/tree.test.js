import { prop, sum } from "ramda";

import { reduceTree } from "./tree";

test("test reduceTree", () => {
  expect(
    reduceTree(prop("children"), (current, children) =>
      sum([current.payload, ...children])
    )({
      payload: 7,
      children: [
        { payload: 3, children: [{ payload: 11, children: [] }] },
        { payload: 2, children: [] },
        { payload: 1, children: [] },
      ],
    })
  ).toEqual(24);
});
