// @flow

import Entity from "./Entity";
import type { EntityType } from "../../flowTypes";

const Enemy = ({
  x,
  y,
  name,
}: {
  x: number,
  y: number,
  name: string,
}): EntityType => {
  const enemy = Entity({
    size: 64,
    x,
    y,
    name,
    type: "enemy",
    color: "rgb(100, 150, 200)",
  });

  return enemy;
};

export default Enemy;
