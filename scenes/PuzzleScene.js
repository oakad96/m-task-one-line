import { OneLinePuzzle } from "../gameObjects/OneLinePuzzle.js";

export class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: "PuzzleScene" });
  }

  init(data) {
    this.puzzleData = data.puzzleData;
  }

  create() {
    // Create the puzzle game object
    this.puzzle = new OneLinePuzzle(this, this.puzzleData);

    // Override the puzzle complete callback
    this.puzzle.onPuzzleComplete = (success) => {
      const text = success ? "Puzzle Completed!" : "Game Over!";
      const color = success ? 0x00ff00 : 0xff0000;

      // Add completion text
      const completionText = this.add
        .text(this.cameras.main.centerX, this.cameras.main.centerY, text, {
          fontSize: "32px",
          fill: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      // Add overlay
      const overlay = this.add.graphics();
      overlay.fillStyle(color, 0.3);
      overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

      // Add restart button
      const restartButton = this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY + 50,
          "Restart",
          {
            fontSize: "24px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 },
          }
        )
        .setOrigin(0.5)
        .setInteractive();

      restartButton.on("pointerdown", () => {
        this.scene.restart({ puzzleData: this.puzzleData });
      });
    };

    // Add debug mode toggle
    const debugButton = this.add
      .text(10, 10, "Toggle Debug", {
        fontSize: "16px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    debugButton.on("pointerdown", () => {
      this.puzzle.setDebugMode(!this.puzzle.debugMode);
    });
  }
}
