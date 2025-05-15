export default class MircoGame {
  constructor({ input, assets, libs, miRCoState }) {
    /** Leave most of this stuff - it's to help you! */
    this.input = input
    this.assets = assets
    this.libs = libs
    this.miRCoState = miRCoState

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
      bagOffset: 0,
      passenger: {
        x: 0,
        y: 0,
        isVisible: true,
        pos: -1,
        lastVisible: Date.now(),
      },
      startTime: Date.now(),
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state

    /** do stuff with game state here - check for winning and losing! */
    // example
    if (this.input.isPressedLeft()) {
      state.bagOffset = -1
    } else if (this.input.isPressedRight()) {
      state.bagOffset = 1
    } else {
      state.bagOffset = 0
    }

    if (state.passenger.pos === state.bagOffset) {
      state.passenger.isVisible = false
    }

    const now = Date.now()
    if (
      Math.random() > 0.75 &&
      !state.passenger.isVisible &&
      now - state.passenger.lastVisible > 1000
    ) {
      state.passenger.isVisible = true
      state.passenger.lastVisible = now

      state.passenger.pos = Math.random() > 0.5 ? -1 : 1
      if (state.passenger.pos === 1) {
        state.passenger.x = 600
      } else {
        state.passenger.x = 0
      }
    }

    if (now + 200 > state.startTime + 5000 && !state.passenger.isVisible) {
      this.state.won = true
    }
    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    /** Render stuff with p5.... */
    p5.background(255)

    // p5.imageMode(p5.CENTER)
    p5.image(this.assets['subway-bg.jpg'], -500, -300, 1500, 900)
    p5.image(this.assets['man.png'], 200, 50)
    p5.image(
      this.assets['suitcase.png'],
      300 + state.bagOffset * 250,
      250,
      200,
      200
    )

    if (state.passenger.isVisible) {
      const img =
        state.passenger.pos === -1
          ? 'passenger-right.png'
          : 'passenger-left.png'
      p5.image(
        this.assets[img],
        state.passenger.x - 300,
        state.passenger.y,
        800,
        1200
      )
    }

    if (state.won) {
      p5.textSize(48)
      p5.textAlign(p5.CENTER)
      p5.strokeWeight(4)
      p5.stroke(255)
      p5.fill(0, 255, 0) // green
      p5.text('You won!!', p5.width / 2, p5.height / 2)
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
