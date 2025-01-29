export class PuzzleDataEnricher {
  static enrichPuzzleData(puzzleData) {
    const { nodes, adjacencyList, adjacency } = puzzleData;
    const connections = adjacencyList || adjacency;

    // Create new arrays for enriched data
    const enrichedNodes = [...nodes];
    const enrichedConnections = [];
    const nodeIndexMap = new Map(); // Maps original edge key to midpoint node index

    // First pass: Create midpoint nodes and build the mapping
    connections.forEach((connectedNodes, fromIndex) => {
      const newConnections = [];

      connectedNodes.forEach((toIndex) => {
        // Only process each edge once (when fromIndex < toIndex)
        if (fromIndex < toIndex) {
          // Calculate midpoint
          const fromNode = nodes[fromIndex];
          const toNode = nodes[toIndex];
          const midpoint = {
            x: (fromNode.x + toNode.x) / 2,
            y: (fromNode.y + toNode.y) / 2,
          };

          // Add midpoint node and store its index
          const midpointIndex = enrichedNodes.length;
          enrichedNodes.push(midpoint);

          // Store mapping for this edge
          const edgeKey = `${fromIndex}-${toIndex}`;
          nodeIndexMap.set(edgeKey, midpointIndex);
        }
      });
    });

    // Second pass: Create new adjacency list with midpoint connections
    for (let i = 0; i < connections.length; i++) {
      const newConnections = [];
      connections[i].forEach((j) => {
        // Get the correct order for edge key
        const [minIndex, maxIndex] = [i, j].sort((a, b) => a - b);
        const edgeKey = `${minIndex}-${maxIndex}`;
        const midpointIndex = nodeIndexMap.get(edgeKey);

        if (midpointIndex !== undefined) {
          // Connect original node to midpoint
          newConnections.push(midpointIndex);
        }
      });
      enrichedConnections.push(newConnections);
    }

    // Add connections for midpoint nodes
    nodeIndexMap.forEach((midpointIndex, edgeKey) => {
      const [node1, node2] = edgeKey.split("-").map(Number);
      const midpointConnections = [node1, node2];
      enrichedConnections.push(midpointConnections);
    });

    return {
      nodes: enrichedNodes,
      adjacencyList: enrichedConnections,
    };
  }
}
