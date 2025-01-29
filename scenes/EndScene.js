export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
  }

  init(data) {
    this.success = data.success;
    this.endCard = data.endCard;
  }

  create() {
    // Display end card
    this.add.image(400, 300, this.endCard);

    // Add click handler for app store redirect
    this.input.on("pointerdown", () => {
      // Replace with actual app store URL
      window.location.href = "https://apps.apple.com/your-app-url";
    });

    // Auto redirect after 2 seconds
    this.time.delayedCall(2000, () => {
      window.location.href = "https://apps.apple.com/your-app-url";
    });
  }
}
