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
      won: false,
      colorUnderBall: [0, 0, 0],
    }
  }

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    const customState = {
      courseNum: Math.floor(Math.random() * Object.values(this.assets).length),
      angle: 0,
      putted: false,
      ballSpeed: 0.5,
      ball: {
        x: canvas.width / 2,
        y: canvas.height - 80,
      },
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  colorsMatch(color1, color2) {
    return (
      Math.abs(color1[0] - color2[0]) < 5 &&
      Math.abs(color1[1] - color2[1]) < 5 &&
      Math.abs(color1[2] - color2[2]) < 5
    )
  }

  /** logic to update game state */
  update(dt) {
    const state = this.state

    const rotateSpeed = 0.001
    if (!state.putted) {
      if (this.input.isPressedRight()) {
        state.angle += rotateSpeed * dt
      }
      if (this.input.isPressedLeft()) {
        state.angle -= rotateSpeed * dt
      }
      if (this.input.isPressedUp() || this.input.isPressedDown()) {
        state.putted = true
        this.input.gamepad.pulse()
      }
    }

    if (state.putted && !state.gameOver) {
      const COLOR_EDGE = [69, 156, 47]
      const COLOR_SAND = [255, 220, 96]
      const COLOR_GOAL = [87, 61, 32]
      if (this.colorsMatch(state.colorUnderBall, COLOR_GOAL)) {
        state.won = true
        state.gameOver = true
        return
      }
      if (this.colorsMatch(state.colorUnderBall, COLOR_EDGE)) {
        state.gameOver = true
        return
      }
      if (this.colorsMatch(state.colorUnderBall, COLOR_SAND)) {
        state.ballSpeed = state.ballSpeed * 0.9
      }

      state.ball.x +=
        Math.cos(state.angle - Math.PI / 2) * this.state.ballSpeed * dt
      state.ball.y +=
        Math.sin(state.angle - Math.PI / 2) * this.state.ballSpeed * dt
    }

    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    this.libs.p5.image(
      Object.values(this.assets)[state.courseNum],
      20,
      20,
      p5.width - 40,
      p5.height - 40
    )
    state.colorUnderBall = this.libs.p5.get(state.ball.x, state.ball.y)
    console.log(state.colorUnderBall)

    if (!state.putted) {
      // Draw the aiming line
      p5.stroke(60, 60, 60)
      p5.line(
        p5.width / 2,
        p5.height - 80,
        p5.width / 2 + Math.cos(state.angle - Math.PI / 2) * 100,
        p5.height - 80 + Math.sin(state.angle - Math.PI / 2) * 100
      )
    }

    // Draw the ball
    p5.fill(255, 0, 0)
    p5.ellipse(state.ball.x, state.ball.y, 20, 20)

    if (state.won) {
      p5.textSize(50)
      p5.text('🎉', state.ball.x + 10, state.ball.y + 20)
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
