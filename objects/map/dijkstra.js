// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04

const getTileById = id => tile => {
  return tile.id === id;
};

const getDiff = arr1 => arr2 => {
  return arr1.filter(i => arr2.indexOf(i) < 0);
};

export const getDijkstraPath = (map, id1, id2) => {
  // console.log("Checking path");
  const endTile = map.find(getTileById(id2));
  if (endTile === undefined || endTile.type === "wall") {
    console.log("Can't get a path to a wall tile!");
    return {
      distance: 10000,
      path: [],
    };
  }

  const { parents, distances } = getDistancesFromOrigin(map, id1);

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
  let red = 20;
  path.map(tile => {
    red += 10;
    if (red > 255) red = 255;
    return (tile.color = `rgb(${red}, 0, 255)`);
  });
  endTile.color = "rgb(255, 150, 200)";
  return {
    distance: distances[id2],
    path,
  };
};

export const getFurthestTile = (map, originID) => {
  const { distances } = getDistancesFromOrigin(map, originID);
  let furthestID = "";
  Object.entries(distances).reduce((furthest, tile) => {
    if (tile[1] > furthest) {
      furthest = tile[1];
      furthestID = tile[0];
    }
    return furthest;
  }, 0);
  return map.find(getTileById(furthestID));
};

const getDistancesFromOrigin = (
  map,
  originID
): {
  distances: any,
  parents: any,
} => {
  console.time("get distances");
  const distances = {};
  const parents = {
    originID: undefined,
  };
  const processed = [];
  const allCheckableIDs = map
    .map(tile => {
      if (tile.type === "ground") {
        return tile.id;
      }
    })
    .filter(tile => tile !== undefined);

  const startTile = map.find(getTileById(originID));
  processed.push(startTile.id);
  Object.entries(startTile.neighbors).forEach(pair => {
    let id = pair[0];
    let neighbor = pair[1];
    distances[id] = neighbor.distance;
    parents[id] = startTile.id;
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
            distances[tileID] = newDistance;
            if (tileID !== originID) {
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

  console.timeEnd("get distances");
  return {
    distances,
    parents,
  };
};
