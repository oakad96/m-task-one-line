import { LoadScene } from "./scenes/LoadScene";
import { GameScene } from "./scenes/GameScene";
import { EndScene } from "./scenes/EndScene";
import { PuzzleScene } from "./scenes/PuzzleScene";

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: "#ffffff",
  scene: [LoadScene, GameScene, EndScene, PuzzleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
