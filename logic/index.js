import detectCollision from "./detectCollision";
import { triggerKeyAction, actionKeys } from "./triggerKeyAction";
import {
  relocateIfPastBorder,
  doneColliding,
  checkIfPlayerHitWall,
  getOrThrow,
} from "./misc";

module.exports = {
  detectCollision,
  relocateIfPastBorder,
  triggerKeyAction,
  doneColliding,
  checkIfPlayerHitWall,
  getOrThrow,
  actionKeys,
};
