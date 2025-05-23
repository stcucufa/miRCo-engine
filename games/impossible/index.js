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
      keyY: 0,
      keyX: 0,
      speed: 4,
      keys: ['left', 'up', 'down'],
      keySize: 150, // size of the falling key
      bgKeySize: 400, // size of the background keys
      bgKeyWidth: 400, // width of the background keys
      messageScale: 0, // for animation
      messageRotation: 0, // for animation
      showHint: false,
      hintTimer: 0
    }
  }

  /** Create model */
  init(canvas) {
    // Set initial X position - align witheither left or up down keys
    const centerX = canvas.width
    const offset = this.state.keySize * (Math.random() < 0.5 ? 2.65 : 3.45)
    this.state.keyX = centerX - offset
  }

  /** logic to update game state */
  update(dt) {
    const state = this.state
    const p5 = this.libs.p5

    // Don't update if game is over
    if (state.gameOver) {
      // Animate the message
      state.messageScale = Math.min(1, state.messageScale + 0.1)
      state.messageRotation = Math.sin(p5.frameCount * 0.1) * 0.1
      this.draw()
      return
    }

    // Update hint timer
    if (state.showHint) {
      state.hintTimer -= dt
      if (state.hintTimer <= 0) {
        state.showHint = false
      }
    }

    // Move the key down
    state.keyY += state.speed

    // Check if key reached bottom
    if (state.keyY > p5.height) {
      state.won = false
      state.gameOver = true
    }

    // Only the right key is correct
    if (this.input.isPressedRight()) {
      state.won = true
      state.gameOver = true
    } else if (this.input.isPressedLeft() || this.input.isPressedUp() || this.input.isPressedDown()) {
      // Any other key press is wrong but not game over
      state.won = false // technically this is default state but written out for the sake of clarity
      state.showHint = true
      state.hintTimer = 1 // Show hint for 1 second
    }

    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5

    /** Render stuff with p5.... */

    // Clear background
    p5.background(255)

    // Draw the static background keys
    p5.imageMode(p5.CENTER)
    p5.image(
      this.assets["keys.png"],
      p5.width / 2,
      p5.height / 2,
      state.bgKeyWidth,
      state.bgKeySize
    )

    // Draw the falling key with rotation
    p5.push()
    p5.translate(state.keyX, state.keyY)
    // Rotate based on round number - more rounds = faster rotation
    p5.rotate(p5.frameCount * 0.05 * (this.mirco.round || 1))
    p5.image(
      this.assets["key.png"],
      0,
      0,
      state.keySize,
      state.keySize
    )
    p5.pop()

    // Draw hint if active
    if (state.showHint) {
      p5.textSize(32)
      p5.textAlign(p5.CENTER)
      p5.fill(255, 0, 0)
      p5.text("Press the right key!", p5.width / 2, p5.height - 50)
    }

    // Draw game over message with effects
    if (state.gameOver) {
      // Draw semi-transparent overlay
      p5.fill(0, 0, 0, 100)
      p5.rect(0, 0, p5.width, p5.height)

      // Save the current transformation state
      p5.push()
      
      // Move to center and apply animations
      p5.translate(p5.width / 2, p5.height / 2)
      p5.rotate(state.messageRotation)
      p5.scale(state.messageScale)

      // Draw the message with a shadow
      p5.textSize(72)
      p5.textAlign(p5.CENTER, p5.CENTER)
      
      // Draw shadow
      p5.fill(0, 0, 0, 100)
      p5.text(state.won ? 'YOU WIN!' : 'GAME OVER!', 4, 4)
      
      // Draw main text
      p5.fill(state.won ? 0 : 255, state.won ? 255 : 0, 0)
      p5.text(state.won ? 'YOU WIN!' : 'GAME OVER!', 0, 0)

      // Restore the transformation state
      p5.pop()
    }
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
