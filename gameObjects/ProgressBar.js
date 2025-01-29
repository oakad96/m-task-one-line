import { gameConfig } from "../config/gameConfig.js";

export class ProgressBar {
  constructor(scene) {
    this.scene = scene;
    this.progress = 0;
    this.setup();
  }

  setup() {
    this.createBackground();
    this.createFill();
    this.createBrainIndicator();
    this.updateProgress(0);
  }

  createBackground() {
    const { width, height, borderWidth, backgroundColor } =
      gameConfig.progressBar;
    this.background = this.scene.add.graphics();
    this.background.lineStyle(borderWidth, 0xffffff);
    this.background.fillStyle(backgroundColor, 1);
    this.background.fillRoundedRect(
      180 - width / 2,
      110,
      width,
      height,
      height / 2
    );
    this.background.strokeRoundedRect(
      180 - width / 2,
      110,
      width,
      height,
      height / 2
    );
  }

  createFill() {
    this.fill = this.scene.add.graphics();
    this.fill.fillStyle(gameConfig.progressBar.fillColor, 1);
  }

  createBrainIndicator() {
    const { width, height } = gameConfig.progressBar;
    this.brainIndicator = this.scene.add.image(
      180 - width / 2,
      110 + height / 2,
      "brain-progress"
    );
    this.brainIndicator.setOrigin(0.5);
    this.brainIndicator.setDisplaySize(30, 30);
    this.brainIndicator.setDepth(1);
  }

  updateProgress(progress) {
    const { width, height } = gameConfig.progressBar;
    this.fill.clear();

    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (clampedProgress > 0) {
      this.fill.fillStyle(gameConfig.progressBar.fillColor, 1);
      this.fill.fillRoundedRect(
        180 - width / 2,
        110,
        width * clampedProgress,
        height,
        height / 2
      );

      const newX = 180 - width / 2 + width * clampedProgress;
      this.brainIndicator.x = newX;
      this.brainIndicator.y = 110 + height / 2;
    }

    this.progress = clampedProgress;
  }

  reset() {
    const { width } = gameConfig.progressBar;
    this.fill.clear();
    this.brainIndicator.x = 180 - width / 2;
    this.progress = 0;
  }
}
