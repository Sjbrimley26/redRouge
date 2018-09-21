// @flow

// http://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/

import type { EntityType, FloorTileType } from "../../flowTypes";

const getFOV = (player: EntityType, tiles: FloorTileType[]) => {
  const checkOctant = (player, tiles, octantZone) => {
    const line = ShadowLine();
    let fullShadow = false;
    for (let row = 1; row <= player.sightRadius; row++) {
      for (let col = 0; col <= row; col++) {
        let x, y;
        let [transformX, transformY] = [
          ...transformOctant(row, col, octantZone),
        ];
        x = player.x + transformX * 64;
        y = player.y + transformY * 64;
        const foundTile = tiles.find(tile => tile.x == x && tile.y == y);
        if (foundTile === undefined) {
          continue;
        }
        let visibility;
        if (fullShadow) {
          visibility = "hidden";
        } else {
          let projection = projectTile(row, col);
          visibility = line.isInShadow(projection) ? "hidden" : "visible";
          if (visibility == "visible" && foundTile.isOpaque) {
            line.add(projection);
            fullShadow = line.isFullShadow();
          }
        }
        foundTile.visibility = visibility;
      }
    }
  };

  const transformOctant = (row, col, octant): number[] => {
    switch (octant) {
      case 0:
        return [col, -row];
      case 1:
        return [row, -col];
      case 2:
        return [row, col];
      case 3:
        return [col, row];
      case 4:
        return [-col, row];
      case 5:
        return [-row, col];
      case 6:
        return [-row, -col];
      case 7:
        return [-col, -row];
    }
  };

  for (let i = 0; i < 8; i++) {
    checkOctant(player, tiles, i);
  }
};

const ShadowLine = () => {
  return {
    shadows: [],

    isInShadow(projection) {
      return this.shadows.some(shadow => shadow.contains(projection));
    },

    add(shadow) {
      let index = 0;
      for (; index < this.shadows.length; index++) {
        // Stop when we hit the insertion point.
        if (this.shadows[index].start >= shadow.start) break;
      }

      // The new shadow is going here. See if it overlaps the
      // previous or next.
      var overlappingPrevious;
      if (index > 0 && this.shadows[index - 1].end > shadow.start) {
        overlappingPrevious = this.shadows[index - 1];
      }

      var overlappingNext;
      if (
        index < this.shadows.length &&
        this.shadows[index].start < shadow.end
      ) {
        overlappingNext = this.shadows[index];
      }

      // Insert and unify with overlapping shadows.
      if (overlappingNext != null) {
        if (overlappingPrevious != null) {
          // Overlaps both, so unify one and delete the other.
          overlappingPrevious.end = overlappingNext.end;
          this.shadows.splice(index, 1);
        } else {
          // Overlaps the next one, so unify it with that.
          overlappingNext.start = shadow.start;
        }
      } else {
        if (overlappingPrevious != null) {
          // Overlaps the previous one, so unify it with that.
          overlappingPrevious.end = shadow.end;
        } else {
          if (this.shadows.length == 0) {
            this.shadows.push(shadow);
          } else {
            this.shadows.splice(index, 0, shadow);
          }
          // Does not overlap anything, so insert.
        }
      }
    },

    isFullShadow() {
      return (
        this.shadows.length == 1 &&
        this.shadows[0].start == 0 &&
        this.shadows[0].end == 1
      );
    },
  };
};

const Shadow = (start, end) => {
  return {
    start,
    end,
    contains(otherShadow) {
      return this.start <= otherShadow.start && this.end >= otherShadow.end;
    },
  };
};

const projectTile = (row, col) => {
  const topLeft = col / (row + 2);
  const bottomRight = (col + 1) / (row + 1);
  return Shadow(topLeft, bottomRight);
};

export default getFOV;
