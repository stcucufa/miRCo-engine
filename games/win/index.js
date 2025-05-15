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
    const pad = 20
    this.minX = pad
    this.minY = pad
    this.maxX = this.libs.p5.width - pad * 4
    this.maxY = this.libs.p5.height - pad * 2
    this.finishLine = this.maxX - pad * 8

    const customState = {
      playingSound: false,
      penelopePos: {
        x: this.minX,
        y: 100,
      },
      notDogPos: {
        x: this.minX,
        y: this.maxY - 200,
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
    this.state.totalTime += dt

    if (!this.state.playingSound)
      this.libs.sound.play(this.assets['whirring.wav'])

    this.state.playingSound = true

    if (this.state.gameOver) {
      this.draw()
      return
    }

    const moveSize = 6

    if (this.input.isPressedUp()) {
      this.state.penelopePos.y -= moveSize
    }
    if (this.input.isPressedDown()) {
      this.state.penelopePos.y += moveSize
    }
    if (this.input.isPressedLeft()) {
      this.state.penelopePos.x -= moveSize
    }
    if (this.input.isPressedRight()) {
      this.state.penelopePos.x += moveSize
    }

    // clamp pos
    this.state.penelopePos.x = Math.min(
      this.maxX,
      Math.max(this.minX, this.state.penelopePos.x)
    )
    this.state.penelopePos.y = Math.min(
      this.maxY,
      Math.max(this.minY, this.state.penelopePos.y)
    )

    if (this.state.penelopePos.x > this.finishLine) {
      this.state.won = true
      this.state.gameOver = true
      this.libs.sound.play(this.assets['cheers.wav'])
    } else {
      this.state.notDogPos.x += moveSize / 2

      if (this.state.notDogPos.x > this.finishLine) {
        this.state.won = false
        this.state.gameOver = true
        this.libs.sound.stop(this.assets['whirring.wav'])
      }
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const { penelopePos, notDogPos, won, gameOver, totalTime } = this.state
    const p5 = this.libs.p5
    p5.angleMode(p5.DEGREES)

    p5.background(255)

    // Enemy
    this.drawDog({
      pos: notDogPos,
      file: 'not-dog.png',
      dance: gameOver && !won,
      flip: gameOver && won,
      width: 1563,
      height: 1164,
    })

    // Penelope
    this.drawDog({
      pos: penelopePos,
      file: 'penelope.png',
      dance: gameOver && won,
      flip: gameOver && !won,
      width: 643,
      height: 750,
    })

    p5.line(this.finishLine + 40, 0, this.finishLine + 40, p5.height)

    // Celebrate
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

  drawDog({ pos, file, dance, flip, width, height }) {
    const { totalTime } = this.state

    const p5 = this.libs.p5
    p5.push()
    const ratio = width / height
    const h = 200
    const w = h * ratio
    let { x, y } = pos

    if (flip || dance) {
      p5.translate(x + w / 2, y + h / 2)
      x = -w / 2
      y = -h / 2
    }

    if (flip) {
      p5.rotate(180)
    }

    if (dance) {
      // little "shifty" animation
      // oscillate between -10 and 10 degrees
      const oscDeg = 20
      let deg = (totalTime / 10) % (oscDeg * 2)
      if (deg > oscDeg) deg = oscDeg * 2 - deg
      p5.rotate(oscDeg / 2 - deg)
    }

    p5.image(this.assets[file], x, y, w, h)

    p5.pop()
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
