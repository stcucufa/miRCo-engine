export default class MircoGame {
  constructor({ canvas, input, assets, win, lose }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = input;
    this.assets = assets;
    this.win = win;
    this.lose = lose;

    this.athlete = {
      x: canvas.width / 2 - 40,
      y: canvas.height - 100,
      width: 80,
      height: 80,
      isDown: true,
      sitUpCount: 0,
    };

    this.requiredSitUps = 5;
    this.lastKeyState = false;
  }

  init() {}

  start() {
    this.startTime = performance.now();
  }

  update(dt) {
    // Track spacebar presses for sit-ups
    const spacePressed = this.input.pressed(" ");

    // Only count a sit-up when transitioning from down to up
    if (spacePressed && !this.lastKeyState && this.athlete.isDown) {
      this.athlete.sitUpCount++;
      this.athlete.isDown = false;
    }

    // Reset position when releasing space
    if (!spacePressed) {
      this.athlete.isDown = true;
    }

    this.lastKeyState = spacePressed;

    // Win condition
    if (this.athlete.sitUpCount >= this.requiredSitUps) {
      this.win();
    }

    // Lose if time runs out
    if (performance.now() - this.startTime > 5000) {
      this.lose();
    }

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw athlete
    ctx.save();
    ctx.translate(
      this.athlete.x + this.athlete.width / 2,
      this.athlete.y + this.athlete.height / 2
    );
    ctx.rotate(this.athlete.isDown ? 0 : -Math.PI / 4);
    ctx.drawImage(
      this.assets["situp.png"],
      -this.athlete.width / 2,
      -this.athlete.height / 2,
      this.athlete.width,
      this.athlete.height
    );
    ctx.restore();

    // Draw counter
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(
      `Sit-ups: ${this.athlete.sitUpCount}/${this.requiredSitUps}`,
      10,
      30
    );
  }

  end() {}
}
