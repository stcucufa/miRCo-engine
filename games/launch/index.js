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
    console.log('init')
    const customState = {
      timeHeld: 0,
      state: 'idle',
      penelopePos: {
        x: 320,
        y: 330,
        accel: 0,
      },
      totalTime: 0,
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const { propSpeed, timeHeld, state } = this.state
    this.state.totalTime += dt

    if (state === 'launch') {
      // Won -- move penelope up
      this.state.penelopePos.accel += dt / 100
      this.state.penelopePos.y -= this.state.penelopePos.accel
      this.draw()
      return
    }

    const nextState = { propSpeed, timeHeld, state }

    if (this.input.isPressedUp()) {
      nextState.state = 'accel'
      nextState.timeHeld += dt
    } else {
      nextState.state = 'idle'
      nextState.timeHeld = 0
    }

    if (timeHeld > 1500) {
      nextState.state = 'launch'
      nextState.won = true
      nextState.gameOver = true
    }

    if (nextState.state !== state) {
      // state change
      if (nextState.state === 'accel')
        this.libs.sound.play(this.assets['whirring.wav'])
      if (nextState.state === 'idle')
        this.libs.sound.stop(this.assets['whirring.wav'])
      if (nextState.state === 'launch')
        this.libs.sound.play(this.assets['cheers.wav'])
    }

    this.state = { ...this.state, ...nextState }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const { penelopePos, won, totalTime, state } = this.state
    const p5 = this.libs.p5
    p5.angleMode(p5.DEGREES)

    p5.background(255)

    // Penelope
    p5.push()

    const ratio = 643 / 750
    const height = 225
    const width = height * ratio
    let { x, y } = penelopePos

    if (state === 'accel') {
      // little "shifty" animation
      p5.translate(x + width / 2, y + height / 2)
      // penelope is now at origin
      x = -width / 2
      y = -height / 2
      // oscillate between -10 and 10 degrees
      const oscDeg = 20
      let deg = (totalTime / 10) % (oscDeg * 2)
      if (deg > oscDeg) deg = oscDeg * 2 - deg
      p5.rotate(oscDeg / 2 - deg)
    }

    p5.image(this.assets['penelope.png'], x, y, width, height)

    p5.pop()

    if (won) {
      p5.push()

      const midpointX = p5.width / 2
      const midpointY = p5.height / 2

      p5.textSize(48)
      p5.textAlign(p5.CENTER)
      const rot = (totalTime / 2) % 360

      p5.push()
      p5.translate(midpointX / 3, midpointY / 2)
      p5.rotate(rot)
      p5.text('👏', 0, 0)
      p5.pop()

      p5.push()
      p5.translate(midpointX + (midpointX / 3) * 2, midpointY / 2)
      p5.rotate(-rot)
      p5.text('👏', 0, 0)
      p5.pop()

      p5.pop()
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
