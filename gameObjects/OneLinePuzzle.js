import { gameConfig } from "../config/gameConfig.js";

export class OneLinePuzzle {
  constructor(scene, puzzleData, templateKey) {
    this.scene = scene;
    this.nodes = puzzleData.nodes;
    this.adjacencyList = puzzleData.adjacencyList || puzzleData.adjacency;
    this.usedEdges = new Set();
    this.usedNodes = new Set();
    this.currentPath = [];
    this.isDrawing = false;
    this.debugMode = false;
    this.isGameOver = false;
    this.junctionTweens = []; // Initialize the array to store tweens
    this.isGameOver = false; // Initialize isGameOver flag

    // Calculate center offset for the drawing area
    const centerX = gameConfig.display.width / 2;
    const centerY = gameConfig.display.height / 2;
    const offsetY = -50; // Adjust vertical position to match template

    // Create template image at the center of the drawing area
    this.templateImage = scene.add.image(
      centerX,
      centerY + offsetY,
      templateKey
    );

    this.junctionNodes = new Set(
      this.adjacencyList.reduce((acc, connections, index) => {
        if (connections.length >= 3) {
          acc.push(index);
        }
        return acc;
      }, [])
    );

    // Get original image dimensions and calculate scale
    const originalWidth = this.templateImage.width;
    const originalHeight = this.templateImage.height;
    const imageScale =
      gameConfig.display.squareSize / Math.max(originalWidth, originalHeight);

    // Scale image maintaining aspect ratio
    this.templateImage.setScale(imageScale);
    this.templateImage.setDepth(0);
    this.templateImage.setAlpha(0.3);

    // Graphics layers with proper depth ordering
    this.debugGraphics = scene.add.graphics().setDepth(1);
    this.connectionGraphics = scene.add.graphics().setDepth(2);
    this.nodeGraphics = scene.add.graphics().setDepth(3);

    // Create a mask using the template image itself
    const bitmapMask = new Phaser.Display.Masks.BitmapMask(
      scene,
      this.templateImage
    );
    this.connectionGraphics.setMask(bitmapMask);

    // Store center position and scale for node calculations
    this.centerPosition = { x: centerX, y: centerY - 10 };
    this.scale = imageScale * 3.4; // Increased from 0.5 to 1.2 to match template size better

    this.setupNodes();
    this.setupInputHandlers();
  }

  destroy() {
    // Clean up graphics and image
    this.templateImage.destroy();
    this.debugGraphics.destroy();
    this.connectionGraphics.destroy();
    this.nodeGraphics.destroy();
    this.nodeSprites.forEach((sprite) => sprite.destroy());
  }

  setupNodes() {
    // Calculate the bounding box of all nodes
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    this.nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    const nodeWidth = maxX - minX;
    const nodeHeight = maxY - minY;

    // Create interactive circles for each node
    this.nodeSprites = this.nodes.map((node, index) => {
      // Center and scale the nodes
      const x =
        (node.x - minX - nodeWidth / 2) * this.scale + this.centerPosition.x;
      const y =
        (node.y - minY - nodeHeight / 2) * this.scale + this.centerPosition.y;

      const circle = this.scene.add.circle(x, y, 5, 0x00ff00);
      circle.setInteractive({
        hitArea: new Phaser.Geom.Circle(0, 0, 20),
        hitAreaCallback: Phaser.Geom.Circle.Contains,
      });
      circle.nodeIndex = index;
      circle.setDepth(3);
      return circle;
    });

    // Add visual indicators for junction nodes
    this.nodeSprites.forEach((sprite, index) => {
      if (this.junctionNodes.has(index)) {
        sprite.fillColor = 0xffa500; // Orange for junctions
        sprite.setRadius(8);

        // Add glow effect and store the tween reference
        const tween = this.scene.tweens.add({
          targets: sprite,
          radius: { from: 8, to: 10 },
          yoyo: true,
          repeat: -1,
          duration: 800,
        });
        this.junctionTweens.push(tween);
      }
    });

    // Store the transformation for line drawing
    this.nodeTransform = {
      scale: this.scale,
      offsetX: minX + nodeWidth / 2,
      offsetY: minY + nodeHeight / 2,
    };

    if (this.debugMode) {
      this.drawDebugView();
    }
  }

  setupInputHandlers() {
    this.nodeSprites.forEach((node) => {
      node.on("pointerdown", () => this.startDrawing(node.nodeIndex));
      node.on("pointerover", () => this.continueDrawing(node.nodeIndex));
    });

    this.scene.input.on("pointerup", () => this.endDrawing());
  }

  startDrawing(nodeIndex) {
    if (this.isGameOver) return;
    this.isDrawing = true;
    this.currentPath = [nodeIndex];
    this.drawCurrentPath();
  }

  continueDrawing(nodeIndex) {
    if (!this.isDrawing || this.isGameOver) return;

    const lastNode = this.currentPath[this.currentPath.length - 1];
    if (nodeIndex === lastNode) return;

    console.log("Attempting to connect:", lastNode, "->", nodeIndex);

    // Check if this would create an invalid overlap
    const edgeKey = this.getEdgeKey(lastNode, nodeIndex);
    if (
      this.usedEdges.has(edgeKey) &&
      !this.junctionNodes.has(lastNode) &&
      !this.junctionNodes.has(nodeIndex)
    ) {
      console.log("Invalid overlap detected");
      this.onPuzzleComplete(false);
      this.isDrawing = false;
      this.currentPath = [];
      return;
    }

    if (this.isValidConnection(lastNode, nodeIndex)) {
      console.log("Valid connection, adding node:", nodeIndex);
      this.currentPath.push(nodeIndex);
      this.usedNodes.add(nodeIndex);
      this.usedEdges.add(edgeKey);
      console.log("Current used nodes:", Array.from(this.usedNodes));
      this.drawCurrentPath();

      if (this.onDrawingUpdate) {
        this.onDrawingUpdate();
      }
    }
  }

  hasWon() {
    console.log("hasWon check started");
    // First, check if all nodes are visited
    if (this.usedNodes.size !== this.nodes.length) {
      console.log("hasWon: not all nodes visited");
      return false;
    }

    // Count total non-junction edges in the puzzle
    let totalNonJunctionEdges = 0;
    this.adjacencyList.forEach((connections, fromNode) => {
      connections.forEach((toNode) => {
        if (
          !this.junctionNodes.has(fromNode) &&
          !this.junctionNodes.has(toNode)
        ) {
          totalNonJunctionEdges++;
        }
      });
    });
    totalNonJunctionEdges = totalNonJunctionEdges / 2;

    // Count used non-junction edges
    let usedNonJunctionEdges = 0;
    this.usedEdges.forEach((edge) => {
      const [n1, n2] = edge.split("-").map(Number);
      if (!this.junctionNodes.has(n1) && !this.junctionNodes.has(n2)) {
        usedNonJunctionEdges++;
      }
    });

    console.log(
      "hasWon final check:",
      usedNonJunctionEdges === totalNonJunctionEdges
    );
    return usedNonJunctionEdges === totalNonJunctionEdges;
  }

  endDrawing() {
    if (!this.isDrawing) {
      console.log("Not drawing, returning");
      return;
    }
    this.isDrawing = false;

    console.log("Current path length:", this.currentPath.length);
    console.log("Used nodes:", Array.from(this.usedNodes));
    console.log("Total nodes:", this.nodes.length);

    // Always show fail alert if path is too short
    if (this.currentPath.length < 2) {
      console.log("Game Over - path too short");
      this.onPuzzleComplete(false);
      this.currentPath = [];
      return;
    }

    // Check if it's a valid winning state
    const hasWon = this.hasWon();
    console.log("hasWon result:", hasWon);

    if (hasWon) {
      console.log("Success - puzzle completed!");
      this.onPuzzleComplete(true);
    } else {
      // Reset game state if not won (instead of showing game over)
      console.log("Resetting game state");
      this.usedEdges.clear();
      this.usedNodes.clear();
      this.currentPath = [];
      this.drawCurrentPath(); // Clear the drawn path
    }
  }

  isValidConnection(fromNode, toNode) {
    // Prevent immediate backtracking
    if (
      this.currentPath.length >= 2 &&
      toNode === this.currentPath[this.currentPath.length - 2]
    ) {
      return false;
    }

    // Check adjacency
    if (!this.adjacencyList[fromNode].includes(toNode)) return false;

    // Check edge usage
    const edgeKey = this.getEdgeKey(fromNode, toNode);
    const isJunction =
      this.junctionNodes.has(fromNode) || this.junctionNodes.has(toNode);

    // Allow edge reuse only at junctions
    return !this.usedEdges.has(edgeKey) || isJunction;
  }

  getEdgeKey(node1, node2) {
    // Create a consistent key for an edge regardless of direction
    return [Math.min(node1, node2), Math.max(node1, node2)].join("-");
  }

  drawCurrentPath() {
    this.connectionGraphics.clear();

    // Draw existing connections
    this.usedEdges.forEach((edge) => {
      const [n1, n2] = edge.split("-").map(Number);
      this.drawLine(n1, n2, 0x00ff00);
    });

    // Draw current path with Phaser-compatible smooth lines
    if (this.currentPath.length > 1) {
      const points = this.currentPath.map((nodeIndex) => {
        const node = this.nodeSprites[nodeIndex];
        return new Phaser.Math.Vector2(node.x, node.y);
      });

      // Create smooth path using Phaser's Curve
      const curve = new Phaser.Curves.Spline(points);

      this.connectionGraphics.lineStyle(16, 0x00ff00, 0.8);
      curve.draw(this.connectionGraphics, 64); // 64 divisions for smoothness
    }
  }

  drawLine(fromNodeIndex, toNodeIndex, color) {
    const fromNode = this.nodeSprites[fromNodeIndex];
    const toNode = this.nodeSprites[toNodeIndex];

    this.connectionGraphics.lineStyle(12, color);
    this.connectionGraphics.beginPath();
    this.connectionGraphics.moveTo(fromNode.x, fromNode.y);
    this.connectionGraphics.lineTo(toNode.x, toNode.y);
    this.connectionGraphics.strokePath();
  }

  drawDebugView() {
    this.debugGraphics.clear();

    // Draw all possible connections
    this.debugGraphics.lineStyle(1, 0xcccccc);
    this.adjacencyList.forEach((connections, fromIndex) => {
      const fromNode = this.nodes[fromIndex];
      connections.forEach((toIndex) => {
        const toNode = this.nodes[toIndex];

        const x1 =
          (fromNode.x - this.nodeTransform.offsetX) * this.nodeTransform.scale +
          this.centerPosition.x;
        const y1 =
          (fromNode.y - this.nodeTransform.offsetY) * this.nodeTransform.scale +
          this.centerPosition.y;
        const x2 =
          (toNode.x - this.nodeTransform.offsetX) * this.nodeTransform.scale +
          this.centerPosition.x;
        const y2 =
          (toNode.y - this.nodeTransform.offsetY) * this.nodeTransform.scale +
          this.centerPosition.y;

        this.debugGraphics.beginPath();
        this.debugGraphics.moveTo(x1, y1);
        this.debugGraphics.lineTo(x2, y2);
        this.debugGraphics.strokePath();
      });
    });
  }

  isStuck() {
    // Check if there are any valid moves remaining from any node
    for (let fromNode = 0; fromNode < this.nodes.length; fromNode++) {
      const connections = this.adjacencyList[fromNode] || [];
      for (const toNode of connections) {
        if (this.isValidConnection(fromNode, toNode)) {
          return false;
        }
      }
    }
    return true;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    if (enabled) {
      this.drawDebugView();
    } else {
      this.debugGraphics.clear();
    }
  }

  onPuzzleComplete(success) {
    console.log("onPuzzleComplete called with:", success);
    this.isGameOver = true;

    // Show alert message
    const text = success ? "SUCCESS!" : "GAME OVER!";
    const color = success ? 0x00ff00 : 0xff0000;

    try {
      // Create a semi-transparent background that stays on screen
      const graphics = this.scene.add.graphics();
      console.log("Graphics created successfully");

      // Set graphics properties
      graphics.clear(); // Clear any existing graphics
      graphics.setDepth(9999); // Ensure it's above everything
      graphics.fillStyle(0x000000, 0.7);
      graphics.fillRect(
        0,
        0,
        gameConfig.display.width,
        gameConfig.display.height
      );

      // Add text that stays on screen
      const alertText = this.scene.add.text(
        gameConfig.display.width / 2,
        gameConfig.display.height / 2,
        text,
        {
          fontFamily: "Arial",
          fontSize: "64px",
          fontStyle: "bold",
          color: "#" + color.toString(16).padStart(6, "0"),
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      );
      console.log("Text created successfully");

      alertText.setOrigin(0.5);
      alertText.setDepth(10000); // Even higher than the background

      // Store references to cleanup when destroying
      this.gameOverGraphics = graphics;
      this.gameOverText = alertText;

      console.log("Game over screen elements created successfully");
    } catch (error) {
      console.error("Error creating game over screen:", error);
    }
  }

  destroy() {
    // Stop all tweens before destroying sprites
    this.junctionTweens.forEach((tween) => tween.stop());

    // Clean up graphics and image
    this.templateImage.destroy();
    this.debugGraphics.destroy();
    this.connectionGraphics.destroy();
    this.nodeGraphics.destroy();
    this.nodeSprites.forEach((sprite) => sprite.destroy());

    // Clean up game over elements if they exist
    if (this.gameOverGraphics) this.gameOverGraphics.destroy();
    if (this.gameOverText) this.gameOverText.destroy();
  }
}
