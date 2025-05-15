export default class MircoGame {
  constructor({ input, assets, libs }) {
    /** Leave most of this stuff - it's to help you! */
    this.input = input
    this.assets = assets
    this.libs = libs

    this.state = {
      // defaults
      gameOver: false,
      won: false, // set false = lose by default, true = win by default
    }
  }

  /** Create model */
  init(canvas) {
    const CANVAS_WIDTH = canvas.width // 400;
    const CANVAS_HEIGHT = canvas.height // (400 * 16) / 9;
    const GRAVITY = 1000;

    const customState = {
      CANVAS_WIDTH: CANVAS_WIDTH,
      CANVAS_HEIGHT: CANVAS_HEIGHT,
      GRAVITY: GRAVITY,
      isHeld: false,
      isReleased: false,
      personStartX: CANVAS_WIDTH / 3,
      personStartY: CANVAS_HEIGHT / 3,
      personX: CANVAS_WIDTH / 3,
      personY: CANVAS_HEIGHT / 3,
      poolX: (CANVAS_WIDTH * 5) / 8,
      poolY: CANVAS_HEIGHT - 15.5,
      timeToJump: 1,
      personImg: this.assets['person.png'],
      pathEndX: null,
      pathEndY: null,
      startTime: null,
      personXVelocity: null,
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    p5.background('#FEDAB1')
    p5.fill(0)
    
    this.drawPerson();
    this.drawPool();
    this.drawDivingPlatform();

    if (this.state.isHeld && !this.input.isPressedUp()) {
      // key used to be pressed but is now released
      this.keyReleased();
    } else if (!this.state.isHeld && this.input.isPressedUp()) {
      // key was previously not pressed but now is
      this.keyPressed();
    }
    
    if (this.state.isHeld && !this.state.isReleased) {
      this.drawProjectedPath();
    }
      
    if (this.state.isReleased) {
      // p5.line(this.state.pathEndX, this.state.pathEndY, this.state.CANVAS_WIDTH / 3, this.state.CANVAS_HEIGHT / 3);
      this.movePerson();
    }
    this.checkWinCondition();

    /** Render stuff with p5.... */

    // p5.background(255);
    // p5.push();
    // p5.translate(
    //   state.athlete.x + state.athlete.width / 2,
    //   state.athlete.y + state.athlete.height / 2
    // );
    // p5.rotate(state.athlete.isDown ? 0 : -p5.PI / 4);
    // p5.imageMode(p5.CENTER);
    // p5.image(
    //   this.assets["situp.png"],
    //   0,
    //   0,
    //   state.athlete.width,
    //   state.athlete.height
    // );
    // p5.pop();

    // // Draw counter
    // p5.textSize(24);
    // p5.textAlign(p5.LEFT);
    // p5.fill(0);
    // p5.text(
    //   `Sit-ups: ${state.athlete.sitUpCount}/${state.requiredSitUps}`,
    //   10,
    //   30
    // );

    // if (state.gameOver) {
    //   p5.textSize(48);
    //   p5.textAlign(p5.CENTER);
    //   p5.fill(0, 255, 0); // green
    //   p5.text(state.message, p5.width / 2, p5.height / 2);
    // }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }

  drawPerson() {
    this.libs.p5.imageMode(this.libs.p5.CENTER); // to center the image on the position
    this.libs.p5.image(this.state.personImg, this.state.personX, this.state.personY, 50, 60); // width & height can be customized
  }

  drawPool() {
    this.libs.p5.fill(114, 178, 235);
    this.libs.p5.rect(this.state.poolX, this.state.poolY, 70, 15);
    this.libs.p5.stroke(0);
  }

  drawDivingPlatform() {
    this.libs.p5.fill(128, 128, 128);
    this.libs.p5.rect(this.state.personStartX - 90, this.state.personStartY + 30, 15, this.state.CANVAS_HEIGHT - this.state.personStartY)
    this.libs.p5.rect(this.state.personStartX - 100, this.state.CANVAS_HEIGHT - 5, 40, 5)
    
    this.libs.p5.fill(255, 255, 255);
    this.libs.p5.rect(this.state.personStartX - 75, this.state.personStartY + 30, 100, 5)
  }

  drawProjectedPath() {
    let elapsedSeconds = (this.libs.p5.millis() - this.state.startTime) / 1000;
    const intervalChange = (this.state.poolX - this.state.personX) / 1;

    this.state.pathEndX = this.state.personX + intervalChange * elapsedSeconds;
    this.state.pathEndY = this.state.poolY;
    this.libs.p5.line(this.state.pathEndX, this.state.pathEndY, this.state.CANVAS_WIDTH / 3, this.state.CANVAS_HEIGHT / 3);
  }

  keyPressed() {
    this.state.startTime = this.libs.p5.millis();
    this.state.isHeld = true;
    this.state.isReleased = false;
    console.log("pressed");
  }

  keyReleased() {
    this.state.startTime = this.libs.p5.millis();
    this.state.isHeld = false;
    this.state.isReleased = true;
    this.state.personXVelocity = (this.state.pathEndX - this.state.personX) / this.state.timeToJump;
    this.state.personYVelocity = (this.state.pathEndY - this.state.personY - 0.5 * this.state.GRAVITY * this.state.timeToJump * this.state.timeToJump) / this.state.timeToJump;
    console.log("released");
  }

  movePerson() {
    this.movePersonX();
    this.movePersonY();
  }

  movePersonX() {
    let elapsedSeconds = (this.libs.p5.millis() - this.state.startTime) / 1000;
    this.state.personX = this.state.personStartX + this.state.personXVelocity * elapsedSeconds;
  }
  
  movePersonY() {
    let elapsedSeconds = (this.libs.p5.millis() - this.state.startTime) / 1000;
    this.state.personY = this.state.personStartY + this.state.personYVelocity * elapsedSeconds + 0.5 * this.state.GRAVITY * elapsedSeconds * elapsedSeconds;
  }

  checkWinCondition() {
    if (this.state.personY > this.state.poolY && this.state.personX > this.state.poolX && this.state.personX < this.state.poolX + 70) {
      console.log("won!");
      this.state.won = true;
    }
  }
}
