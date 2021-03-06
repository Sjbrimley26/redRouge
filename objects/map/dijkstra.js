// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04

const getTileById = id => tile => {
  return tile.id === id;
};

const getDiff = arr1 => arr2 => {
  return arr1.filter(i => arr2.indexOf(i) < 0);
};

export const getDijkstraPath = (map, startTile, endTile) => {
  // console.log("Checking path");
  if (endTile === undefined || endTile.type === "wall") {
    console.log(new Error("Can't get a path to a wall tile!"));
    return {
      distance: 10000,
      path: [],
    };
  }

  const id2 = endTile.id;

  const { parents, distances } = getDistancesFromOrigin(map, startTile);

  let path = [];
  let parent = parents[id2];
  while (parent) {
    if (path.includes(parent)) {
      console.log(
        "Cyclical loop!",
        Object.entries(parents)
          .filter(([id]) => path.includes(id))
          .map(([id, parentID]) => {
            return [map.find(getTileById(id)), parentID];
          })
      );
      break;
    }
    path.push(parent);
    parent = parents[parent];
  }
  path.reverse();
  path = path.map(id => map.find(getTileById(id)));
  return {
    distance: distances[id2],
    path,
  };
};

export const getFurthestTile = (map, originTile) => {
  const { distances } = getDistancesFromOrigin(map, originTile);
  let furthestID = "";
  let furthest = 0;
  Object.entries(distances).forEach(tile => {
    if (tile[1] > furthest) {
      furthest = tile[1];
      furthestID = tile[0];
    }
  });
  return map.find(getTileById(furthestID));
};

const getDistancesFromOrigin = (
  map,
  originTile
): {
  distances: any,
  parents: any,
} => {
  // console.time("get distances");
  const distances = {};
  const parents = {};
  if (originTile === undefined) {
    console.log(new Error("Invalid origin tile"));
    return {
      distances: {},
      parents: {},
    };
  }
  const originID = originTile.id;
  parents[originID] = undefined;
  const processed = [];
  const allCheckableIDs = map
    .map(tile => {
      if (tile.type !== "wall") {
        return tile.id;
      }
    })
    .filter(tile => tile !== undefined);

  processed.push(originID);
  Object.entries(originTile.neighbors).forEach(pair => {
    const id = pair[0];
    const neighbor = pair[1];
    distances[id] = neighbor.distance;
    parents[id] = originTile.id;
  });

  let iterations = 0;
  const iterationLimit = Math.floor(allCheckableIDs.length * 1.1);
  while (
    !allCheckableIDs.every(id => processed.includes(id)) &&
    iterations < iterationLimit
  ) {
    iterations++;
    Object.entries(distances).forEach(combo => {
      const id = combo[0];
      const distance = combo[1];
      if (processed.includes(id)) {
        return;
      }
      const tile = map.find(getTileById(id));
      Object.entries(tile.neighbors).forEach(pair => {
        const tileID = pair[0];
        const neighbor = pair[1];
        const newDistance = distance + neighbor.distance;
        if (Object.keys(distances).includes(tileID)) {
          if (distances[tileID] > newDistance) {
            if (tileID !== originID) {
              distances[tileID] = newDistance;
              parents[tileID] = id;
            }
          }
        } else {
          distances[tileID] = newDistance;
          if (tileID !== originID) {
            parents[tileID] = id;
          }
        }
      });
      processed.push(id);
    });
  }

  if (allCheckableIDs.length > processed.length) {
    console.log(
      "Some tiles weren't checked",
      getDiff(allCheckableIDs)(processed)
    );
  }

  // console.timeEnd("get distances");
  return {
    distances,
    parents,
  };
};

export const getMultiplePaths = (map, originTile, destinationTileArr) => {
  const { parents, distances } = getDistancesFromOrigin(map, originTile);
  if (Object.keys(parents).length === 0) {
    console.log(new Error("Could not get paths."));
    return undefined;
  }
  return destinationTileArr.map(endTile => {
    if (endTile === undefined || endTile.type === "wall") {
      console.log(new Error("Can't get a path to a wall tile!"));
      return {
        distance: 10000,
        path: [],
      };
    }

    const id2 = endTile.id;

    let path = [];
    let parent = parents[id2];
    while (parent) {
      if (path.includes(parent)) {
        // this only happens with negative distances
        console.log(
          "Cyclical loop!",
          Object.entries(parents)
            .filter(([id]) => path.includes(id))
            .map(([id, parentID]) => {
              return [map.find(getTileById(id)), parentID];
            })
        );
        break;
      }
      path.push(parent);
      parent = parents[parent];
    }
    path.reverse();
    path = path.map(id => map.find(getTileById(id)));
    return {
      id: id2,
      distance: distances[id2],
      path,
    };
  });
};
