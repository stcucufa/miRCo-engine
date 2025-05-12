export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input;
    this.assets = assets;
  }

  /** Create model */
  init(canvas) {
    // Initialize any game state
    return {
      athlete: {
        x: canvas.width / 2 - 40,
        y: canvas.height - 100,
        width: 80,
        height: 80,
        isDown: true,
        sitUpCount: 0,
      },
      requiredSitUps: 5,
      lastKeyState: false,
      startTime: performance.now(),
      gameOver: false,
      won: false, // set win to true or false by default
      message: "",
    };
  }

  /** logic to update game state */
  update(state, dt) {
    if (state.gameOver) return; // stop gameplay once win/lose

    // change state based on inputs
    // Track spacebar presses for sit-ups
    const spacePressed = this.input.pressed(" ");

    // Only count a sit-up when transitioning from down to up
    if (spacePressed && !state.lastKeyState && state.athlete.isDown) {
      state.athlete.sitUpCount++;
      state.athlete.isDown = false;

      if (state.athlete.sitUpCount >= state.requiredSitUps) {
        state.gameOver = true;
        state.message = "Winner!";
        state.won = true;
      }
    }

    // Reset position when releasing space
    if (!spacePressed) {
      state.athlete.isDown = true;
    }

    state.lastKeyState = spacePressed;
  }

  /** render visuals based on game state */
  draw(state, p5) {
    p5.background(255);
    p5.push();
    p5.translate(
      state.athlete.x + state.athlete.width / 2,
      state.athlete.y + state.athlete.height / 2
    );
    p5.rotate(state.athlete.isDown ? 0 : -p5.PI / 4);
    p5.imageMode(p5.CENTER);
    p5.image(
      this.assets["situp.png"],
      0,
      0,
      state.athlete.width,
      state.athlete.height
    );
    p5.pop();

    // Draw counter
    p5.textSize(24);
    p5.textAlign(p5.LEFT);
    p5.fill(0);
    p5.text(
      `Sit-ups: ${state.athlete.sitUpCount}/${state.requiredSitUps}`,
      10,
      30
    );

    if (state.gameOver) {
      p5.textSize(48);
      p5.textAlign(p5.CENTER);
      p5.fill(0, 255, 0); // Green text for winner
      p5.text(state.message, p5.width / 2, p5.height / 2);
    }
  }

  end(s) {
    return s.won;
  }
}
