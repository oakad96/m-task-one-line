import { gameConfig } from "../config/gameConfig.js";
import { ProgressBar } from "../gameObjects/ProgressBar.js";
import { OneLinePuzzle } from "../gameObjects/OneLinePuzzle.js";
import { PuzzleDataEnricher } from "../gameObjects/PuzzleDataEnricher.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {
    this.version = data.version;
  }

  preload() {
    // Load puzzle data
    this.load.json(
      "potionbottle",
      "assets/drawing-templates/potion-bottle.json"
    );
    this.load.json("tablelamp", "assets/drawing-templates/table-lamp.json");
    this.load.json("ship", "assets/drawing-templates/ship.json");

    // Load template images
    this.load.image(
      "potionbottle",
      "assets/drawing-templates/potion-bottle.png"
    );
    this.load.image("tablelamp", "assets/drawing-templates/table-lamp.png");
    this.load.image("ship", "assets/drawing-templates/ship.png");
  }

  create() {
    this.createBackgrounds();
    this.createUI();

    // Initialize game objects
    this.progressBar = new ProgressBar(this);
    this.currentPuzzleIndex = 0;
    this.puzzleTemplates = this.version?.includes("tek")
      ? ["potionbottle"]
      : ["potionbottle", "tablelamp", "ship"];

    this.createPuzzle();
  }

  createPuzzle() {
    const templateKey = this.puzzleTemplates[this.currentPuzzleIndex];
    const puzzleData = this.cache.json.get(templateKey);

    // Create the puzzle
    if (this.puzzle) {
      this.puzzle.destroy();
    }
    this.puzzle = new OneLinePuzzle(this, puzzleData, templateKey);

    // Override puzzle complete callback
    this.puzzle.onPuzzleComplete = (success) => {
      if (success) {
        // Add a small delay before moving to next puzzle
        this.time.delayedCall(2000, () => {
          this.nextPuzzle();
        });
      }
    };

    // Setup progress update callback
    this.puzzle.onDrawingUpdate = () => {
      const progress = this.calculateProgress();
      this.progressBar.updateProgress(progress);
    };
  }

  calculateProgress() {
    // Count visited nodes vs total nodes
    const visitedNodes = new Set();
    this.puzzle.usedEdges.forEach((edge) => {
      const [node1, node2] = edge.split("-").map(Number);
      visitedNodes.add(node1);
      visitedNodes.add(node2);
    });
    return Math.min(visitedNodes.size / this.puzzle.nodes.length, 1);
  }

  nextPuzzle() {
    this.currentPuzzleIndex++;
    if (this.currentPuzzleIndex >= this.puzzleTemplates.length) {
      this.endGame(true);
      return;
    }

    this.createPuzzle();
    this.progressBar.reset();
  }

  endGame(success) {
    // Show appropriate message
    const text = success ? "WELL DONE!" : "GAME OVER!";
    const textStyle = {
      fontFamily: "Arial Black",
      fontSize: "48px",
      color: success ? "#00ff00" : "#ff0000",
      stroke: "#000000",
      strokeThickness: 6,
      align: "center",
    };

    const message = this.add
      .text(
        gameConfig.display.width / 2,
        gameConfig.display.height / 2,
        text,
        textStyle
      )
      .setOrigin(0.5);

    // Wait a moment, then restart
    this.time.delayedCall(2000, () => {
      this.scene.restart({ version: this.version });
    });
  }

  createBackgrounds() {
    // Main background
    this.background = this.add.image(
      gameConfig.display.width / 2,
      gameConfig.display.height / 2,
      "bg1"
    );
    this.background.setDisplaySize(
      gameConfig.display.width,
      gameConfig.display.height
    );
    this.background.setDepth(-1);

    // Drawing area background
    this.squareBackground = this.add.image(
      gameConfig.display.width / 2,
      gameConfig.display.height / 2,
      "bg2"
    );
    this.squareBackground.setDisplaySize(
      gameConfig.display.squareSize,
      gameConfig.display.squareSize
    );
    this.squareBackground.setDepth(-0.5);

    // Bottom yellow banner
    const bannerHeight = 60;
    const banner = this.add.graphics();
    banner.fillStyle(0xffd700);
    banner.fillRect(
      0,
      gameConfig.display.height - bannerHeight,
      gameConfig.display.width,
      bannerHeight
    );
    banner.lineStyle(4, 0xdaa520);
    banner.strokeRect(
      0,
      gameConfig.display.height - bannerHeight,
      gameConfig.display.width,
      bannerHeight
    );
    banner.setDepth(-0.2);
  }

  createUI() {
    this.createTitleText();
    this.createSubtitleText();
    this.createInstallButton();
    this.createLogo();
    this.createDescriptionLogo();
  }

  createTitleText() {
    const titleText = this.add.text(180, 50, "CAN YOU DRAW IT", {
      fontFamily: "Arial Black, Arial Bold, Arial",
      fontSize: "32px",
      fontWeight: "bold",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center",
    });
    titleText.setOrigin(0.5);
  }

  createSubtitleText() {
    const subtitleText = this.add.text(
      180,
      75,
      "no lifting fingers or overplapping lines",
      {
        fontFamily: "Arial Black, Arial Bold, Arial",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      }
    );
    subtitleText.setOrigin(0.5);
  }

  createInstallButton() {
    const button = this.add.image(
      gameConfig.display.width - 10,
      gameConfig.display.height - 15,
      "install-button"
    );
    button.setDisplaySize(100, 27);
    button.setOrigin(1, 1);
    button.setInteractive();
    button.on("pointerdown", () => {
      console.log("Install button clicked");
    });
  }

  createLogo() {
    const logo = this.add.image(
      gameConfig.display.width - 320,
      gameConfig.display.height - 40,
      "logo"
    );
    logo.setDisplaySize(75, 75);
    logo.setOrigin(0.5);
  }

  createDescriptionLogo() {
    const descriptionLogo = this.add.image(
      155,
      gameConfig.display.height - 25,
      "description-logo"
    );
    descriptionLogo.setDisplaySize(150, 80);
    descriptionLogo.setOrigin(0.5);
  }
}
