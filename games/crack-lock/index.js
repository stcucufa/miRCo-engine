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

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    const customState = {
      lock: [0, 0, 0],
      currLockIndex: 0,
      targetLock: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    const state = this.state;

    if (state.lock[0] == state.targetLock[0] && state.lock[1] == state.targetLock[1] && state.lock[2] == state.targetLock[2]) {
      state.gameOver = true;
      state.won = true;
    } else {
      if (this.input.justPressedUp()) {
        state.lock[state.currLockIndex] = (state.lock[state.currLockIndex] + 1) % 10;
      }
      if (this.input.justPressedDown()) {
        // in js, the mod operator is the remainder operator, so we add back the mod value to make the result positive
        state.lock[state.currLockIndex] = (state.lock[state.currLockIndex] - 1 + 10) % 10;
      }
      if (this.input.justPressedLeft()) {
        state.currLockIndex = Math.max(0, state.currLockIndex - 1);
      }
      if (this.input.justPressedRight()) {
        state.currLockIndex = Math.min(2, state.currLockIndex + 1);
      }
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    /** Render stuff with p5.... */
    p5.background(255);
    p5.textSize(36);
    p5.textAlign(p5.CENTER);
    p5.text("COMBO:", p5.width / 2, p5.height / 6)

    p5.text(state.targetLock.join(' '), p5.width / 2, p5.height / 4);

    // Calculate lock dimensions
    const lockWidth = state.lock.length * p5.width / 20;
    const lockHeight = 80;
    const lockX = p5.width / 2 - lockWidth / 2;
    const lockY = p5.height / 2 - 50;

    // Draw lock body (rectangle)
    p5.noFill();
    p5.stroke(0);
    p5.strokeWeight(3);
    p5.fill('grey');
    p5.rect(lockX, lockY, lockWidth, lockHeight);
    p5.noFill();

    // Draw lock shackle (arc)
    if (!state.won) {
      const shackleWidth = lockWidth * 0.6;
      const shackleHeight = 75;
      const shackleX = lockX + lockWidth / 2;
      const shackleY = lockY - 3;

      p5.strokeWeight(10);
      p5.arc(shackleX, shackleY, shackleWidth, shackleHeight, p5.PI, 0);
    }
    else {
      // in the winning case, the arc is pushed up so that the lock is "unlocked"
      const shackleWidth = lockWidth * 0.6;
      const shackleHeight = 75;
      const shackleX = lockX + lockWidth / 2;
      const shackleY = lockY - 25;

      p5.strokeWeight(10);
      p5.arc(shackleX, shackleY, shackleWidth, shackleHeight, p5.PI, 0);
    }
    // Draw the lock combination numbers
    p5.fill(0);
    p5.strokeWeight(1);
    let curr_width = 9 * p5.width / 20;
    for (let i = 0; i < state.lock.length; i++) {
      if (state.lock[i] == state.targetLock[i]) {
        p5.fill('green');
        p5.text(state.lock[i], curr_width, p5.height / 2);
        p5.fill('black');
      }
      else if (i == state.currLockIndex) {
        p5.fill('red');
        p5.text(state.lock[i], curr_width, p5.height / 2);
        p5.fill('black');
      } else {
        p5.text(state.lock[i], curr_width, p5.height / 2);
      }
      curr_width += p5.width / 20;
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
