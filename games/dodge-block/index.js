export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input
    this.assets = assets
    this.libs = libs
    this.state = {
      gameOver: false,
      won: true,
    }
  }

  init(canvas) {
    const customState = {
      player: {
        x: 100,
        y: canvas.height - 100,
        width: 60,
        height: 60,
        rotation: 0,
        scale: 1,
      },
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      blocks: [],
      blockSpawnInterval: 300,
      lastSpawnTime: performance.now(),
      startTime: performance.now(),
      startTime: performance.now(),
      message: '',
    }

    customState.blocks.push(this.createBlock())

    this.state = { ...this.state, ...customState }

    this.libs.sound.play(this.assets['alive.mp3'])
    return
  }

  createBlock() {
    return {
      x: Math.random() * (this.state.canvasWidth - 100),
      y: -70,
      width: 100,
      height: 70,
      speed: 0.2 + Math.random() * 0.1,
    }
  }

  update(dt) {
    const s = this.state

    if (s.gameOver) {
      if (s.won) {
        s.player.rotation += 0.2 * dt
      } else {
        s.player.rotation -= 0.3 * dt
        s.player.scale = Math.max(0.1, s.player.scale - 0.002 * dt)
      }
      this.draw()
      return
    }

    // Move player
    if (this.input.isPressedLeft()) s.player.x -= 0.5 * dt
    if (this.input.isPressedRight()) s.player.x += 0.5 * dt

    // Clamp player position using p5 width
    s.player.x = Math.max(
      0,
      Math.min(this.state.canvasWidth - s.player.width, s.player.x)
    )

    // spawn new blocks
    const currentTime = performance.now()
    if (currentTime - s.lastSpawnTime > s.blockSpawnInterval) {
      s.blocks.push(this.createBlock())
      s.lastSpawnTime = currentTime
    }

    // move existing blocks
    s.blocks = s.blocks.filter((block) => {
      // Move block
      block.y += block.speed * dt

      // Check collision
      if (this.collides(s.player, block)) {
        this.libs.sound.play(this.assets['ah.mp3'])
        s.gameOver = true
        s.message = 'Death is not the end.'
        s.won = false
      }

      // Keep block if it's still on screen
      return block.y < 600 // canvas height
    })

    // win condition
    if (performance.now() - s.startTime > 4500) {
      s.gameOver = true
      s.message = "Stayin' alive!"
      s.won = true
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  draw() {
    const s = this.state
    const p5 = this.libs.p5

    p5.background(255)

    p5.push()

    if (s.gameOver) {
      p5.rotate(s.player.rotation * 0.05)
      p5.scale(s.player.scale)
    }
    // draw player
    p5.image(
      this.assets['player.png'],
      s.player.x,
      s.player.y,
      s.player.width,
      s.player.height
    )
    p5.pop()

    // draw blocks
    s.blocks.forEach((block) => {
      p5.image(
        this.assets['block.png'],
        block.x,
        block.y,
        block.width,
        block.height
      )
    })

    // Draw game over message
    if (s.gameOver) {
      p5.textSize(48)
      p5.textAlign(p5.CENTER)
      p5.fill(s.won ? [0, 255, 0] : [255, 0, 0])
      p5.text(s.message, p5.width / 2, p5.height / 2)
    }
  }

  collides(p, b) {
    return (
      p.x < b.x + b.width &&
      p.x + p.width > b.x &&
      p.y < b.y + b.height &&
      p.y + p.height > b.y
    )
  }

  end() {
    return this.state.won
  }
}
