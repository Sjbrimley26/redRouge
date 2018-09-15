import detectCollision from "./detectCollision";
import triggerKeyAction from "./triggerKeyAction";
import {
  relocateIfPastBorder,
  doneColliding,
  checkIfPlayerHitWall,
} from "./misc";

module.exports = {
  detectCollision,
  relocateIfPastBorder,
  triggerKeyAction,
  doneColliding,
  checkIfPlayerHitWall,
};
