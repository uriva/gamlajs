import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { prop } from "./operator.ts";
import { reduceTree } from "./tree.ts";
import { sum } from "./math.ts";

Deno.test("reduceTree", () => {
  type Tree = { payload: number; children: Tree[] };
  assertEquals(
    reduceTree(
      prop<Tree, "children">("children"),
      (current: Tree, children: number[]) =>
        sum([current.payload, ...children]),
    )({
      payload: 7,
      children: [
        { payload: 3, children: [{ payload: 11, children: [] }] },
        { payload: 2, children: [] },
        { payload: 1, children: [] },
      ],
    }),
    24,
  );
});
