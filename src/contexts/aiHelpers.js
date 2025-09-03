// helpers/aiHelpers.js

export const dijkstra = (graph, startNode, endNode) => {
  if (!graph || typeof graph !== 'object' || !startNode || !endNode) {
    throw new Error("Invalid graph, startNode, or endNode");
  }

  const distances = {};
  const prevNodes = {};
  const visited = new Set();
  const pq = new Map();

  for (const node in graph) {
    distances[node] = Infinity;
    pq.set(node, Infinity);
    prevNodes[node] = null;
  }
  distances[startNode] = 0;
  pq.set(startNode, 0);

  while (pq.size > 0) {
    const [currentNode] = [...pq.entries()].sort((a, b) => a[1] - b[1])[0];
    pq.delete(currentNode);

    if (currentNode === endNode) {
      const path = [];
      let node = endNode;
      while (node) {
        path.unshift(node);
        node = prevNodes[node];
      }
      return { path, distance: distances[endNode] };
    }

    const neighbors = graph[currentNode];
    if (!neighbors) {
      console.error(`Node ${currentNode} has no neighbors`);
      continue;
    }

    for (const [neighbor, weight] of Object.entries(neighbors)) {
      if (visited.has(neighbor)) continue;

      const newDistance = distances[currentNode] + weight;
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        prevNodes[neighbor] = currentNode;
        pq.set(neighbor, newDistance);
      }
    }
    visited.add(currentNode);
  }

  return { path: [], distance: Infinity };
};

export const recommendTruck = (weight, state) => {
  return `Truck for ${weight} in ${state}`;
};

export const calculateDeliveryTime = (distance) => {
  const averageSpeed = 50; // Average speed in km/h
  return distance / averageSpeed;
};
