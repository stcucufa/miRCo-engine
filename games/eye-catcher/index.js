export default class MircoGame {

  constructor({ input, assets, libs, mirco }) {
    this.input = input;
    this.assets = assets;
    this.libs = libs;
    this.mirco = mirco;
    this.state = {
      gameOver: false,
      won: false,
    };
  }

  init(canvas) {
    const customState = {
      ghost: {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        v: 0.2
      },
      eyes: {
        x: (Math.random() * 0.8 + 0.1) * canvas.width,
        y: (Math.random() * 0.3 + 0.1) * canvas.height,
        h: Math.random() * Math.PI * 2,
        v: 0.2,
        cooldown: 0
      },
      imageWidth: 72,
      imageHeight: 72,
      distance: 24,
      minX: 0.1 * canvas.width,
      maxX: 0.9 * canvas.width,
      minY: 0.1 * canvas.height,
      maxY: 0.9 * canvas.height,
    };
    this.state = { ...this.state, ...customState };
  }

  update(dt) {
    const { ghost, eyes, distance } = this.state;

    // Update the ghost position from the key presses
    if (this.input.isPressedLeft()) {
      ghost.x -= ghost.v * dt;
    }
    if (this.input.isPressedRight()) {
      ghost.x += ghost.v * dt;
    }
    if (this.input.isPressedUp()) {
      ghost.y -= ghost.v * dt;
    }
    if (this.input.isPressedDown()) {
      ghost.y += ghost.v * dt;
    }

    // Update the eyes position; stay within the screen boundaries, or if the
    // game is won, stick with the ghost.
    eyes.x += Math.cos(eyes.h) * eyes.v * dt;
    eyes.y += Math.sin(eyes.h) * eyes.v * dt;
    const minX = this.state.won ? ghost.x - distance / 4 : this.state.minX;
    const maxX = this.state.won ? ghost.x + distance / 4 : this.state.maxX;
    const minY = this.state.won ? ghost.y - distance / 4 : this.state.minY;
    const maxY = this.state.won ? ghost.y + distance / 4 : this.state.maxY;
    if (eyes.x > maxX) {
      eyes.x = maxX;
      eyes.h = Math.PI - eyes.h;
    } else if (eyes.x < minX) {
      eyes.x = minX;
      eyes.h = Math.PI - eyes.h;
    }
    if (eyes.y > maxY) {
      eyes.y = maxY;
      eyes.h += Math.PI;
    } else if (eyes.y < minY) {
      eyes.y = minY;
      eyes.h += Math.PI;
    }
    eyes.h += (0.5 - Math.random()) * 0.05 * dt;
    if (eyes.cooldown <= 0) {
      eyes.quadrant = Math.cos(eyes.h) > 0 ? (Math.sin(eyes.h) < 0 ? "ne" : "se") : (Math.sin(eyes.h) < 0 ? "nw" : "sw");
      eyes.cooldown = 333;
    } else {
      eyes.cooldown -= dt;
    }

    if (!this.state.won) {
      const dx = ghost.x - eyes.x;
      const dy = ghost.y - eyes.y;
      const d = Math.sqrt((ghost.x - eyes.x) ** 2 + (ghost.y - eyes.y) ** 2);
      this.state.won = d < distance;
    }

    this.draw();
  }

  draw() {
    const { ghost, eyes, distance, imageWidth, imageHeight, won } = this.state;
    const { p5 } = this.libs;

    p5.background("#102040");
    p5.imageMode(p5.CENTER);

    p5.push();
    p5.translate(ghost.x, ghost.y);
    p5.image(this.assets["ghost.png"], 0, 0, imageWidth, imageHeight);
    p5.pop();

    if (won) {
      p5.textSize(48);
      p5.textAlign(p5.CENTER);
      p5.fill("#40ff40");
      p5.text("WINNER", p5.width / 2, p5.height / 2);
    }

    p5.push();
    p5.translate(eyes.x, eyes.y);
    p5.image(this.assets[`eyes-${eyes.quadrant}.png`], 0, 0, imageWidth, imageHeight);
    p5.pop();
  }

  end() {
    return this.state.won;
  }
}
