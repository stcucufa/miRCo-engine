export default class MircoGame {
  constructor({ input, assets, libs, mirco }) {
    /** Leave most of this stuff - it's to help you! */
    this.input = input
    this.assets = assets
    this.libs = libs
    this.mirco = mirco

    this.state = {
      // defaults
      gameOver: false,
      won: false, // set false = lose by default, true = win by default
    }
  }

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    const customState = {
      cracks: 0,
      maxCracks: 8,
      keyPressed: false,
      message: ''
    };

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state

    if (state.gameOver) return // stop gameplay once win/lose

    // change state based on inputs
    var anyKeyPressed = this.input.isPressedLeft() || this.input.isPressedRight() || this.input.isPressedUp() || this.input.isPressedDown();

    /** do stuff with game state here - check for winning and losing! */
    if (anyKeyPressed && !state.keyPressed) {
      this.input.gamepadPulse()

      state.keyPressed = true;
      state.cracks++;
      if (state.cracks > state.maxCracks) {
        state.won = true;
        state.gameOver = true;
        state.message = 'Winner!';
      }
    }

    // Reset position when releasing key
    if (!anyKeyPressed) {
      state.keyPressed = false;
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    /** Render stuff with p5.... */
    p5.background(220);

    if (!state.won) {
      this.drawEgg(p5);
      this.drawCracks(p5, state.cracks);
    } else {
      p5.textSize(180);
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.text("🦖", p5.width / 2, p5.height / 2);
    }

    if (state.gameOver) {
      p5.textSize(48);
      p5.fill(0, 255, 0); // green
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text(state.message, p5.width / 2, p5.height * .25);
    }
  }

  // Draw the egg
  drawEgg(p5) {
    p5.fill(255);
    p5.strokeWeight(2);
    p5.ellipse(400, 300, 150, 180);
  }

  // Draw the cracks
  drawCracks(p5, cracks) {
    p5.stroke(0);
    p5.strokeWeight(2);
    p5.noFill();

    if (cracks >= 1) {
      p5.line(341, 358, 374, 335);
    }
    if (cracks >= 2) {
      p5.line(374, 335, 371, 307);
    }
    if (cracks >= 3) {
      p5.line(474, 297, 430, 270);
    }
    if (cracks >= 4) {
      p5.line(430, 270, 419, 300);
    }
    if (cracks >= 5) {
      p5.line(372, 321, 399, 311);
    }
    if (cracks >= 6) {
      p5.line(342, 241, 384, 238);
    }
    if (cracks >= 7) {
      p5.line(384, 238, 380, 267);
    }
    if (cracks >= 8) {
      p5.line(425, 282, 380, 267);
    }
  }

  // Return true if game is won, false if lost
  end() {
    return this.state.won
  }
}