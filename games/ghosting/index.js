export default class MircoGame {
  constructor({ input, assets, libs, mirco }) {
    this.input = input
    this.assets = assets
    this.libs = libs
    this.mirco = mirco

    this.state = {
      gameOver: false,
      won: false,
    }
  }

  init(canvas) {
    const customState = {
      holePositions: [
        { x: canvas.width / 5, y: canvas.height / 4 },
        { x: (2 * canvas.width) / 5, y: canvas.height / 4 },
        { x: (3 * canvas.width) / 5, y: canvas.height / 4 },
        { x: (4 * canvas.width) / 5, y: canvas.height / 4 },
        { x: canvas.width / 4, y: (2 * canvas.height) / 4 },
        { x: (2 * canvas.width) / 4, y: (2 * canvas.height) / 4 },
        { x: (3 * canvas.width) / 4, y: (2 * canvas.height) / 4 },
        { x: canvas.width / 5, y: (3 * canvas.height) / 4 },
        { x: (2 * canvas.width) / 5, y: (3 * canvas.height) / 4 },
        { x: (3 * canvas.width) / 5, y: (3 * canvas.height) / 4 },
        { x: (4 * canvas.width) / 5, y: (3 * canvas.height) / 4 },
      ],
      score: 0,
      startTime: performance.now(),
      currentAvatar: null,
      lastHoleIndex: -1,
      keyProcessed: false,
      floaters: [],
    }

    this.state = { ...this.state, ...customState }
    this.spawnNewAvatar()
  }

  update(dt) {
    const state = this.state
    if (state.gameOver) return
    this.handleKeyPress()
    this.checkGameOver()
    this.draw()
  }

  handleKeyPress() {
    const state = this.state

    if (state.currentAvatar && !state.currentAvatar.hasBeenJudged) {
      const pressedLeft = this.input.isPressedLeft()
      const pressedRight = this.input.isPressedRight()

      if ((pressedLeft || pressedRight) && !state.keyProcessed) {
        state.keyProcessed = true
        const correctKey = state.currentAvatar.isLoveMatch ? 'right' : 'left'
        const pressedKey = this.input.isPressedLeft() ? 'left' : 'right'
        state.score += pressedKey === correctKey ? 1 : -1
        state.currentAvatar.feedbackEmoji =
          pressedKey === correctKey ? '✅' : '❌'
        state.currentAvatar.hasBeenJudged = true

        setTimeout(() => {
          this.spawnNewAvatar()
          state.keyProcessed = false // Reset after spawn
        }, 300)
      }
    }
  }

  draw() {
    const p5 = this.libs.p5
    p5.background('#f9fafb')
    this.drawHoles()
    this.drawAvatar()
    this.drawFloaters()
    this.displayScore()

    if (this.state.gameOver) {
      p5.push()
      p5.fill(0, 0, 0, 150)
      p5.noStroke()
      p5.rect(0, 0, p5.width, p5.height)
      p5.pop()

      this.showGameOverText()
    }
  }

  end() {
    return this.state.won
  }

  drawHoles() {
    const p5 = this.libs.p5
    for (const pos of this.state.holePositions) {
      p5.fill(0)
      p5.ellipse(pos.x, pos.y, 90, 45)
    }
  }

  drawAvatar() {
    const p5 = this.libs.p5
    const state = this.state
    const avatar = state.currentAvatar

    if (!avatar) return

    const avatarPosition = state.holePositions[avatar.holeIndex]

    if (!avatar.hasBeenJudged) {
      p5.image(avatar.image, avatarPosition.x - 30, avatarPosition.y - 60)
    }

    if (avatar.feedbackEmoji) {
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.textSize(32)
      p5.text(avatar.feedbackEmoji, avatarPosition.x, avatarPosition.y)
    }
  }

  drawFloaters() {
    const p5 = this.libs.p5
    const state = this.state

    if (state.gameOver) {
      return
    }

    const now = performance.now()
    if (Math.floor(now / 100) % 10 === 0) {
      const emoji = state.score > 0 ? '💕' : '👻'
      state.floaters.push({
        x: p5.random(p5.width),
        y: p5.height + 20,
        emoji,
      })
    }

    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const floater = state.floaters[i]
      floater.y -= 3
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.textSize(24)
      p5.text(floater.emoji, floater.x, floater.y)
      if (floater.y < -30) {
        state.floaters.splice(i, 1)
      }
    }
  }

  displayScore() {
    const p5 = this.libs.p5
    p5.fill('#111827')
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.textSize(16)
    p5.text(`Matches: ${this.state.score}`, 10, 10)
  }

  showGameOverText() {
    const p5 = this.libs.p5
    const state = this.state
    let gameOverMessage = ''

    p5.push()
    p5.textSize(48)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.fill(255)
    if (state.won) {
      p5.fill(0, 255, 0)
      gameOverMessage = '💕 You found love!'
    } else {
      p5.fill(255, 0, 0)
      gameOverMessage = '👻 Ghosted!'
    }
    p5.text(gameOverMessage, p5.width / 2, p5.height / 2)
    p5.pop()
  }

  checkGameOver() {
    const state = this.state

    if (performance.now() - state.startTime >= 4500) {
      state.gameOver = true
      state.won = state.score > 0
    }
  }

  spawnNewAvatar() {
    const p5 = this.libs.p5
    const state = this.state
    if (state.currentAvatar != null && !state.currentAvatar.hasBeenJudged) {
      return
    }

    let randomIndex
    do {
      randomIndex = p5.floor(p5.random(state.holePositions.length))
    } while (randomIndex === state.lastHoleIndex)
    state.lastHoleIndex = randomIndex

    const isLoveMatch = p5.random() < 0.5

    this.state.currentAvatar = {
      holeIndex: randomIndex,
      isLoveMatch,
      hasBeenJudged: false,
      feedbackEmoji: null,
      image: this.assets['gigachad.png'],
    }
  }
}
