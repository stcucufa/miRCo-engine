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
      won: true, // set false = lose by default, true = win by default
    }
  }

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    const red = ['red1.png', 'red2.png']
    const gray = ['gray1.png', 'gray2.png']
    const customState = {
      lanes: [50, 200, 350],
      danger: [-100, 250],
      minX: 400,
      cars: [{ frames: red, frame: 0, x: 20, lane: 1 }],
      FrameTime: 100,
      frameTime: 100,
      dx: 1,
      p: 0.1,
      gray,
      crash: ['crash1.png', 'crash2.png'],
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }

    this.libs.sound.play(this.assets['engine.mp3'])
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state
    const [player, ...others] = state.cars

    if (state.won) {
      if (this.input.justPressedUp()) {
        player.lane = Math.max(player.lane - 1, 0)
      }
      if (this.input.justPressedDown()) {
        player.lane = Math.min(player.lane + 1, state.lanes.length - 1)
      }
      for (const car of others) {
        car.x -= state.dx * dt
        if (
          car.x > state.danger[0] &&
          car.x < state.danger[1] &&
          car.lane === player.lane
        ) {
          state.won = false
          state.cars[0].frames = state.crash
          state.cars[0].x = 200
          state.cars.length = 1
          this.libs.sound.stop(this.assets['engine.mp3'])
          this.libs.sound.play(this.assets['crash.mp3'])
          break
        }
      }
    }

    state.frameTime -= dt
    if (state.frameTime < 0) {
      state.frameTime += state.FrameTime
      for (const car of state.cars) {
        car.frame = 1 - car.frame
      }
      if (state.won && Math.random() < state.p) {
        state.cars.push({
          frames: state.gray,
          frame: 0,
          x: 800,
          lane: Math.floor(Math.random() * 3),
        })
      }
    }

    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/
    p5.background('#fff1e8')
    for (const car of state.cars) {
      p5.image(this.assets[car.frames[car.frame]], car.x, state.lanes[car.lane])
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
