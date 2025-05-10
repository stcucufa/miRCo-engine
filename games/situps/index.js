export default class MircoGame {
  //   assets = {
  //     sprites: {
  //         situp: "situp.png"
  //     }
  //   }
  // CYRENE HOT TIPS #3: use this for libs + assets ; pass model (state) as a football
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
      message: "",
    };
  }

  update(s, dt) {
    if (s.gameOver) return;
    // console.log({ state });
    // change state based on inputs
    // Track spacebar presses for sit-ups
    const spacePressed = this.input.pressed(" ");

    // Only count a sit-up when transitioning from down to up
    if (spacePressed && !s.lastKeyState && s.athlete.isDown) {
      s.athlete.sitUpCount++;
      s.athlete.isDown = false;

      if (s.athlete.sitUpCount >= s.requiredSitUps) {
        s.gameOver = true;
        s.message = "Winner!";
      }
    }

    // Reset position when releasing space
    if (!spacePressed) {
      s.athlete.isDown = true;
    }

    s.lastKeyState = spacePressed;
  }

  draw(s, p5) {
    p5.background(255);
    p5.push();
    p5.translate(
      s.athlete.x + s.athlete.width / 2,
      s.athlete.y + s.athlete.height / 2
    );
    p5.rotate(s.athlete.isDown ? 0 : -p5.PI / 4);
    p5.imageMode(p5.CENTER);
    p5.image(this.assets["situp.png"], 0, 0, s.athlete.width, s.athlete.height);
    p5.pop();

    // Draw counter
    p5.textSize(24);
    p5.textAlign(p5.LEFT);
    p5.fill(0);
    p5.text(`Sit-ups: ${s.athlete.sitUpCount}/${s.requiredSitUps}`, 10, 30);

    if (s.gameOver) {
      p5.textSize(48);
      p5.textAlign(p5.CENTER);
      p5.fill(0, 255, 0); // Green text for winner
      p5.text(s.message, p5.width / 2, p5.height / 2);
    }
  }

  end(s) {
    // return true if win
    if (s.athlete.sitUpCount >= s.requiredSitUps) {
      console.log("WINNER");
      return true;
    }
  }
}

// currentElapsed

// lib (sound + physics)
// assets

// init: set model  (game state) CREATE
// update: takes model and modifies <--- libs UPDATE
// draw: taks ctx and model and draw READ
