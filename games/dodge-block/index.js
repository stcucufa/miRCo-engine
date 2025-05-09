export default class MircoGame {
  constructor({ canvas, libs, input, assets, win, lose }) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.assets = assets;
    this.input = input;
    this.win = win;
    this.lose = lose;

    this.player = { x: 100, y: 220, width: 40, height: 40 };
    this.block = {
      x: Math.random() * 200,
      y: -40,
      width: 40,
      height: 40,
      speed: 0.2,
    };
  }

  init() {}

  start() {
    this.startTime = performance.now();
  }

  update(dt) {
    // Move player
    console.log(this.input);
    if (this.input.pressed("ArrowLeft")) this.player.x -= 0.2 * dt;

    if (this.input.pressed("ArrowRight")) this.player.x += 0.2 * dt;

    // Clamp player position
    this.player.x = Math.max(
      0,
      Math.min(this.canvas.width - this.player.width, this.player.x)
    );

    // Move block
    this.block.y += this.block.speed * dt;

    // Collision detection
    if (this.collides(this.player, this.block)) {
      console.log("lose!");
      this.lose();
    }

    // Game timer check
    if (performance.now() - this.startTime > 5000) {
      console.log("win!");
      this.win();
    }

    // Render
    this.draw();
  }

  collides(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.drawImage(
      this.assets["player.png"],
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );
    ctx.drawImage(
      this.assets["block.png"],
      this.block.x,
      this.block.y,
      this.block.width,
      this.block.height
    );
  }

  end() {
    // Clean up if needed
  }
}
