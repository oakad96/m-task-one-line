import { gameConfig } from "../config/gameConfig.js";

export class Template {
  constructor(scene) {
    this.scene = scene;
    this.currentTemplate = 0;
    this.templates = scene.version?.includes("tek")
      ? ["potionbottle"]
      : ["potionbottle", "tablelamp", "ship"];
    this.setupTemplate();
  }

  setupTemplate() {
    this.image = this.scene.add.image(
      180,
      280,
      this.templates[this.currentTemplate]
    );
    this.image.setDisplaySize(
      gameConfig.display.squareSize,
      gameConfig.display.squareSize
    );
    this.image.setDepth(0);
  }

  getCurrentTemplatePath() {
    return gameConfig.templatePaths[this.templates[this.currentTemplate]];
  }

  getTargetDistance() {
    const path = this.getCurrentTemplatePath();
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance;
  }

  next() {
    this.currentTemplate++;
    if (this.currentTemplate < this.templates.length) {
      this.image.setTexture(this.templates[this.currentTemplate]);
      return true;
    }
    return false;
  }

  // Debug method
  drawPath() {
    const path = this.getCurrentTemplatePath();
    const debugGraphics = this.scene.add.graphics();
    debugGraphics.lineStyle(2, 0xff0000);
    debugGraphics.beginPath();
    debugGraphics.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      debugGraphics.lineTo(path[i].x, path[i].y);
    }

    debugGraphics.strokePath();
  }
}
