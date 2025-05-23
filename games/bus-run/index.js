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
      runner: {},
      pedestrians: [],
      vehicles: [],
      sidewalkTop: canvas.height / 6,
      roadTop: (2 * canvas.height) / 6,
      roadBottom: (4 * canvas.height) / 6,
      sidewalkBottom: (5 * canvas.height) / 6,
      runnerY: (5 * canvas.height) / 6 - canvas.height / 12,
      busX: (9 * canvas.width) / 10,
      collisionMargin: canvas.width / 40,
      startTime: performance.now(),
      textSize: 32,
    }
    this.state = { ...this.state, ...customState }
    this.initPeople()
    this.initVehicles()
  }

  update(dt) {
    this.checkKeyPress()
    this.checkIfRunnerCaughtTheBus()
    this.checkGameOver()
    this.draw()
  }

  draw() {
    const state = this.state
    const p5 = this.libs.p5

    p5.background(240)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(state.textSize)

    this.drawRoad()
    this.drawVehicles()
    this.drawPeople()

    if (state.gameOver) {
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

  checkKeyPress() {
    const state = this.state
    const p5 = this.libs.p5

    if (!state.gameOver) {
      if (this.input.isPressedRight()) {
        state.runner.x += state.runner.speed
      }
      if (this.input.isPressedLeft()) {
        state.runner.x = p5.max(0, state.runner.x - state.runner.speed)
      }
      if (this.input.isPressedUp()) {
        state.runner.y = p5.max(
          state.roadTop + p5.height / 12,
          state.runner.y - state.runner.speed
        )
      }
      if (this.input.isPressedDown()) {
        state.runner.y = p5.min(
          p5.height - p5.height / 12,
          state.runner.y + state.runner.speed
        )
      }
    }
  }

  checkGameOver() {
    const state = this.state
    if (performance.now() - state.startTime > 4500) {
      state.gameOver = true
    }
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
      gameOverMessage = '🏆 You caught the bus!'
    } else {
      p5.fill(255, 0, 0)
      gameOverMessage = '🚫 Missed it!'
    }
    p5.text(gameOverMessage, p5.width / 2, p5.height / 2)
    p5.pop()
  }

  initPeople() {
    const p5 = this.libs.p5
    const state = this.state
    let pedestrianEmojis = ['🧍', '🛒', '🧑‍🦽', '', '🧑‍🦼', '🗑️', '🚶‍♀️', '👨‍🦯']
    let pedestrians = state.pedestrians
    let runnerY = state.runnerY

    state.runner = { x: p5.width / 16, y: runnerY, speed: 3, emoji: '🏃‍➡️' }

    for (let i = 0; i < 6; i++) {
      pedestrians.push({
        x: p5.random(
          (2.5 * p5.width) / 16,
          state.busX - 3 * state.collisionMargin
        ),
        y: runnerY,
        emoji: p5.random(pedestrianEmojis),
      })
    }
  }

  initVehicles() {
    const p5 = this.libs.p5
    const state = this.state
    let vehicleEmojis = [
      '🚗',
      '🛵',
      '🚕',
      '🚴',
      '🚑',
      '🚙',
      '🚐',
      '🚓',
      '🚛',
      '🚒',
      '🛻',
      '🏍️',
    ]

    let vehicles = state.vehicles
    let roadTop = state.roadTop
    let roadBottom = state.roadBottom

    for (let i = 0; i < 8; i++) {
      vehicles.push({
        x: p5.random(p5.width),
        y: p5.random(roadTop + 20, roadBottom - 20),
        dir: i % 2 === 0 ? 1 : -1,
        emoji: p5.random(vehicleEmojis),
        speed: p5.random(0.5, 3),
      })
    }
  }

  drawRoad() {
    const p5 = this.libs.p5
    const state = this.state

    // top sidewalk
    p5.fill(220)
    p5.rect(0, state.sidewalkTop, p5.width, state.roadTop)

    // road
    p5.fill(150)
    p5.rect(0, state.roadTop, p5.width, state.roadBottom - state.roadTop)

    // road divider line
    p5.stroke(255)
    p5.strokeWeight(2)
    for (let i = 0; i < p5.width; i += 40) {
      p5.line(
        i,
        (state.roadTop + state.roadBottom) / 2,
        i + 25,
        (state.roadTop + state.roadBottom) / 2
      )
    }
    p5.noStroke()

    // bottom sidewalk
    p5.fill(220)
    p5.rect(
      0,
      state.roadBottom,
      p5.width,
      p5.height - state.roadBottom - p5.height / 6
    )
  }

  drawVehicles() {
    const state = this.state
    const p5 = this.libs.p5

    // Draw the bus a bit bigger than the rest
    p5.push()
    p5.textSize(2 * state.textSize)
    p5.text('🚌', state.busX, state.runnerY)
    p5.pop()

    for (let vehicle of state.vehicles) {
      this.drawVehicle(vehicle)
      if (this.didRunnerCollideWithObstacle(vehicle)) {
        // Uh oh, a car hit you 😭
        state.gameOver = true
        state.won = false
      }
    }
  }

  drawPeople() {
    const state = this.state
    const p5 = this.libs.p5

    p5.text(state.runner.emoji, state.runner.x, state.runner.y)

    for (let pedestrian of state.pedestrians) {
      p5.text(pedestrian.emoji, pedestrian.x, pedestrian.y)

      if (this.didRunnerCollideWithObstacle(pedestrian)) {
        // You've bumped into a pedestrian lol, missed the bus!
        state.gameOver = true
        state.won = false
      }
    }
  }

  drawVehicle(vehicle) {
    const p5 = this.libs.p5
    const state = this.state

    if (!state.gameOver) {
      vehicle.x += vehicle.speed * vehicle.dir
      if (vehicle.x > p5.width + 40) vehicle.x = -40
      if (vehicle.x < -40) vehicle.x = p5.width + 40
    }

    if (vehicle.dir === 1) {
      // since all vehicle emojis face left, flip them rightward if the vehicle is traveling right
      p5.push()
      p5.translate(vehicle.x + state.textSize / 2, vehicle.y) // move to emoji center
      p5.scale(-1, 1) // flip horizontally
      p5.text(vehicle.emoji, 0, 0) // draw emoji at the transformed origin
      p5.pop()
    } else {
      p5.text(vehicle.emoji, vehicle.x, vehicle.y)
    }
  }

  didRunnerCollideWithObstacle(obstacle) {
    const state = this.state
    const p5 = this.libs.p5
    return (
      p5.dist(state.runner.x, state.runner.y, obstacle.x, obstacle.y) <
      state.collisionMargin
    )
  }

  checkIfRunnerCaughtTheBus() {
    const state = this.state
    if (state.runner.x + state.collisionMargin >= state.busX) {
      state.gameOver = true
      state.won = true
    }
  }
}
