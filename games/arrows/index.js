export default class MircoGame {
  constructor({ input, assets, libs, mirco }) {
    /** Leave most of this stuff - it's to help you! */
    this.input = input
    this.assets = assets
    this.libs = libs
    this.mirco = mirco // { round: number, wins: number, losses: number }

    this.state = {
      // defaults
      gameOver: false,
      won: false, // set false = lose by default, true = win by default
    }
  }

  chooseNewDirection() {
    const directions = ["up", "down", "left", "right"].filter( d => d != this.state.direction);
    const nextDirection = directions[ Math.floor(Math.random() * directions.length) ];

    return nextDirection;
  }

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    const customState = {
      direction: this.chooseNewDirection(),
      winning: false,
      losing: false,
      pressed: false,
      score: 0
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state;

    if ( !state.pressed ) {
      state.losing = false;

      if (state.winning ) {
        state.score += 1;
        state.won = state.score > 10;
        state.direction = this.chooseNewDirection()
        state.winning = false;
      }
    }

    const keys = {
      up:    this.input.isPressedUp(),
      down:  this.input.isPressedDown(),
      left:  this.input.isPressedLeft(),
      right: this.input.isPressedRight(),
    }
    state.pressed = Object.entries(keys)
      .filter( ([_, isPressed]) => isPressed )
      .map(([key, _]) => key)[0];


    if ( state.pressed ) {
      console.log("PRESSING", state.pressed, state.direction)
      state.winning = state.pressed == state.direction;

      if( !state.winning ) state.losing = true;
    }

    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    // Set bg
    if (state.winning) {
      p5.background(0, 255, 0);
      p5.fill(255,255,255);
    } else if (state.losing) {
      p5.background(255, 0, 0);
      p5.fill(255,255,255);
    } else {
      p5.background(255, 255, 255)
      p5.fill(0,0,0);
    }

    p5.push();

    // Draw score
    p5.textSize(36);
    p5.textAlign(p5.CENTER);
    p5.fill(0, Math.floor(state.score * (255/10)), 0);
    p5.text(`SCORE: ${state.score}`, p5.width / 2, 50);
    p5.pop();


    if(state.direction){
      p5.push();

      // Show direction
      p5.textSize(128);
      p5.fill(0,0,0);
      p5.textAlign(p5.CENTER, p5.CENTER);

      switch(state.direction) {
        case "up":
          p5.text("↑", p5.width / 2, p5.height / 2);
          break;
        case "down":
          p5.text("↓", p5.width / 2, p5.height / 2);
          break;
        case "left":
          p5.text("←", p5.width / 2, p5.height / 2);
          break;
        case "right":
          p5.text("→", p5.width / 2, p5.height / 2);
          break;
      }
      p5.pop();
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
