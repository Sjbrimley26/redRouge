// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04

const getTileById = id => tile => {
  return tile.id === id;
};

const getDiff = arr1 => arr2 => {
  return arr1.filter(i => arr2.indexOf(i) < 0);
};

export const getDijkstraPath = (map, tile1, tile2) => {
  // console.log("Checking path");
  if (tile2 === undefined || tile2.type === "wall") {
    console.log(new Error("Can't get a path to a wall tile!"));
    return {
      distance: 10000,
      path: [],
    };
  }

  const id2 = tile2.id;

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
  tile2.color = "rgb(255, 150, 200)";
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
  console.time("get distances");
  const distances = {};
  const parents = {};
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

  /*
  const possibleDuplicateParents = [];
  const duplicates = [];
  Object.values(parents).forEach(parent => {
    if (possibleDuplicateParents.includes(parent)) {
      if (!duplicates.includes(parent)) {
        duplicates.push(parent);
      }
      return;
    }
    possibleDuplicateParents.push(parent);
  });
  if (duplicates.length !== 0) {
    console.log(
      "Duplicates detected!",
      duplicates.map(id => map.find(getTileById(id)).type)
    );
  }
  */

  if (allCheckableIDs.length > processed.length) {
    console.log(
      "Some tiles weren't checked",
      getDiff(allCheckableIDs)(processed)
    );
  }

  /*
  let negativeDistances = [];
  Object.entries(distances).forEach(([id, distance]) => {
    if (distance < 0) {
      negativeDistances.push(map.find(getTileById(id)));
    }
  });
  console.log(negativeDistances);
  */

  console.timeEnd("get distances");
  return {
    distances,
    parents,
  };
};
