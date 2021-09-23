import * as cache from "./cache";
import * as functional from "./functional";
import * as io from "./io";
import * as lock from "./lock";
import * as math from "./math";
import * as stringUtils from "./stringUtils";
import * as time from "./time";

export default {
  ...cache,
  ...functional,
  ...io,
  ...lock,
  ...math,
  ...stringUtils,
  ...time,
};
