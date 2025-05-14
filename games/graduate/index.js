export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input
    this.assets = assets
    this.libs = libs

    this.state = {
      // defaults
      gameOver: false,
      won: false, // defaulting to false = lose by default, true = win by default
    }
  }

  /** Create model */
  init(canvas) {
    // Initialize any game state
    var x = this.getRandomInt(0, 100)

    const customState = {
      startTime: performance.now(),
      message: '',
      number: x,
      isPrime: this.isPrime(x),
    }

    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    const state = this.state

    if (state.gameOver) return // stop gameplay once win/lose

    var leftPressed = this.input.isPressedLeft()
    var rightPressed = this.input.isPressedRight()

    if (leftPressed || rightPressed) {
      state.gameOver = true
      state.won = true
      state.message = '¡🐙!'
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5

    p5.background(255)

    p5.textSize(80)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.text('¿🎓?\n\n❌👈      👉❌', p5.width / 2, p5.height / 2)

    if (state.gameOver) {
      p5.textSize(48)
      p5.textAlign(p5.CENTER)
      p5.fill(0, 255, 0) // green
      p5.text(state.message, p5.width / 2, p5.height / 2)
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  isPrime(num) {
    if (num <= 1) return false
    if (num <= 3) return true

    if (num % 2 === 0 || num % 3 === 0) return false

    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false
    }

    return true
  }
}
