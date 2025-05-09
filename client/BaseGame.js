export class BaseGame {
  constructor({ canvas, input, assets, win, lose }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = input;
    this.assets = assets;
    this.win = win;
    this.lose = lose;

    // Common timing and state
    this.startTime = 0;
    this.isPlaying = false;
  }

  init() {
    // Optional initialization
  }

  start() {
    this.startTime = performance.now();
    this.isPlaying = true;
  }

  update(dt) {
    if (!this.isPlaying) return;

    // Check default win condition (5 seconds)
    if (performance.now() - this.startTime > 5000) {
      this.win();
    }
  }

  draw() {
    // Override this in game implementations
  }

  end() {
    this.isPlaying = false;
  }
}
