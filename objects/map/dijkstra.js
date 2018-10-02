// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04

const getTileById = id => tile => {
  return tile.id === id;
};

const getDiff = arr1 => arr2 => {
  return arr1.filter(i => arr2.indexOf(i) < 0);
};

export const getDijkstraPath = (map, tile1, endTile) => {
  // console.log("Checking path");
  if (endTile === undefined || endTile.type === "wall") {
    console.log(new Error("Can't get a path to a wall tile!"));
    return {
      distance: 10000,
      path: [],
    };
  }

  const id2 = endTile.id;

  const { parents, distances } = getDistancesFromOrigin(map, tile1);

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
  let red = 0;
  path.map(tile => {
    red += 10;
    if (red > 255) red = 255;
    if (tile.type === "trigger") {
      return (tile.color = "rgb(255, 90, 0)");
    }
    return (tile.color = `rgb(${red}, 0, 255)`);
  });
  endTile.color = "rgb(255, 150, 200)";
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
    return console.log(new Error("Invalid origin tile"));
  }
  let originID = originTile.id;
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
    let id = pair[0];
    let neighbor = pair[1];
    distances[id] = neighbor.distance;
    parents[id] = originTile.id;
  });

  let iterations = 0;
  let iterationLimit = Math.floor(allCheckableIDs.length * 1.1);
  while (
    !allCheckableIDs.every(id => processed.includes(id)) &&
    iterations < iterationLimit
  ) {
    iterations++;
    Object.entries(distances).forEach(combo => {
      let id = combo[0];
      let distance = combo[1];
      if (processed.includes(id)) {
        return;
      }
      let tile = map.find(getTileById(id));
      Object.entries(tile.neighbors).forEach(pair => {
        let tileID = pair[0];
        let neighbor = pair[1];
        let newDistance = distance + neighbor.distance;
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
    /*
    let red = 0;
    path.map(tile => {
      red += 10;
      if (red > 255) red = 255;
      if (tile.type === "trigger") {
        return (tile.color = "rgb(255, 90, 0)");
      }
      return (tile.color = `rgb(${red}, 0, 255)`);
    });
    endTile.color =
      endTile.type === "trigger" ? "rgb(255, 90, 0)" : "rgb(255, 150, 200)";
    */
    return {
      id: id2,
      distance: distances[id2],
      path,
    };
  });
};
