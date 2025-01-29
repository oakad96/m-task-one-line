import { PuzzleDataEnricher } from "../gameObjects/PuzzleDataEnricher.js";

export class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadScene" });
  }

  preload() {
    // Load puzzle data
    this.load.json("sample-puzzle", "assets/puzzles/sample.json");

    // Load drawing templates
    this.load.image(
      "potion-bottle",
      "assets/drawing-templates/potion-bottle.png"
    );
    this.load.json(
      "potion-bottle-template",
      "assets/drawing-templates/potion-bottle.json"
    );
    this.load.image("tablelamp", "assets/drawing-templates/table-lamp.png");
    this.load.json(
      "table-lamp-template",
      "assets/drawing-templates/table-lamp.json"
    );
    this.load.image("ship", "assets/drawing-templates/ship.png");
    this.load.json("ship-template", "assets/drawing-templates/ship.json");

    this.load.image("description-logo", "assets/brand/onelinedraw_motto.png");
    this.load.image("install-button", "assets/ui/buttons/install.png", {});
    this.load.image("logo", "assets/brand/OneLine-512x512.png");

    // Load backgrounds with debug logging
    console.log("Loading background images...");
    this.load.image("bg1", "assets/background/main-bg.jpg");
    this.load.image("bg2", "assets/background/drawing-area-bg.png");
    this.load.image(
      "brain-progress",
      "assets/background/brain-progress-indicator.png"
    );

    this.load.on("complete", () => {
      console.log("All assets loaded successfully");
    });

    this.load.on("loaderror", (file) => {
      console.error("Error loading asset:", file.src);
    });

    // Load end cards
    this.load.image("topuklu", "assets/drawing-templates/shoe.png");
    this.load.image("topuklu2", "assets/drawing-templates/shoe.png");

    // Load localization
    this.load.json("localization", "assets/localization.json");
  }

  create() {
    // Get the loaded puzzle data and enrich it with midpoints
    const rawPuzzleData = this.cache.json.get("potion-bottle-template");
    const enrichedPuzzleData =
      PuzzleDataEnricher.enrichPuzzleData(rawPuzzleData);

    // Start the puzzle scene with the enriched data
    //this.scene.start("PuzzleScene", { puzzleData: enrichedPuzzleData });
    this.scene.start("GameScene", { version: "Logicus-PF-potionbottle-15sn" });
  }
}
