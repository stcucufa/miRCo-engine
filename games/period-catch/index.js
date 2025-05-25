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
    }
  }

  /** Create model */
  init(canvas) {
    // Initialize any custom game state
    this.libs.sound.play(this.assets['blood.wav'])

    const p5 = this.libs.p5
    const minX = 20
    const maxX = 700
    const dropW = 100

    const pad = 'pad.png'
    const cup = 'cup.png'
    const tampon = 'tampon.png'

    const customState = {
      periodDrop: {
        x: p5.random(p5.width - dropW),
        y: 0,
        w: dropW,
      },
      catcher: {
        x: (maxX - minX) / 2,
        y: p5.height - 100,
        width: 200,
        activeCatcher: pad,
        catchersByLevel: {
          1: pad,
          2: pad,
          3: cup,
          4: cup,
          5: tampon,
        },
        catcherWidths: {
          'pad.png': 150,
          'cup.png': 100,
          'tampon.png': 50,
        },
      },
      catchCount: 0,
      requiredCatchs: 3,
      level: 1,
      lastKeyState: false,
      startTime: performance.now(),
      youLeaked: 'bummer, you leaked',
      noLeaks: 'yay, no leaks!',
      minX: minX,
      maxX: maxX,
      winningDrops: [],
    }

    // leave this - merges default state with your state
    this.state = { ...this.state, ...customState }
  }

  /** logic to update game state */
  update(dt) {
    // this function gets called every tick
    // dt is deltaTime - time between ticks
    const state = this.state
    const p5 = this.libs.p5

    /** do stuff with game state here - check for winning and losing! */
    const moveCatcherInc = 10

    if (this.input.isPressedLeft() && state.catcher.x > state.minX) {
      state.catcher.x -= moveCatcherInc
    }
    if (this.input.isPressedRight() && state.catcher.x < state.maxX) {
      state.catcher.x += moveCatcherInc
    }

    if (state.gameOver == false) {
      state.periodDrop.y += 10
    }

    if (state.periodDrop.y >= state.catcher.y) {
      const catcherLeft = state.catcher.x - state.catcher.width / 2
      const catcherRight = state.catcher.x + state.catcher.width / 2
      const dropTolerance = 15
      if (
        catcherLeft <= state.periodDrop.x + dropTolerance &&
        state.periodDrop.x - dropTolerance <= catcherRight
      ) {
        state.catchCount++
        if (state.catchCount == state.requiredCatchs) {
          state.won = true
          state.gameOver = true
        }
      }

      state.periodDrop.y = 0
      state.periodDrop.x = p5.random(p5.width - 100) + 50

      if (state.level == 5) {
        state.gameOver = true
      } else {
        state.level++
        state.catcher.activeCatcher = state.catcher.catchersByLevel[state.level]
      }
    }

    if (state.gameOver) {
      state.winningDrops.forEach((drop) => {
        drop.y += 10
      })

      for (let i = 0; i < 10; i++) {
        state.winningDrops.push({
          x: p5.random(p5.width),
          y: 0,
        })
      }
    }

    // IMPORTANT: call this method at the end of update()
    this.draw()
  }

  /** render visuals based on game state */
  draw() {
    const state = this.state
    const p5 = this.libs.p5 // you can draw with this if you want https://p5js.org/reference/

    if (state.gameOver) {
      p5.background(128, 0, 0)

      state.winningDrops.forEach((drop) => {
        p5.imageMode(p5.CENTER)
        p5.image(this.assets['period-drop.png'], drop.x, drop.y, 100, 100)
      })

      p5.textSize(70)
      p5.fill(255)
      p5.textAlign(p5.CENTER)

      if (state.won) {
        p5.text(state.noLeaks, p5.width / 2, p5.height / 2)
      } else {
        p5.text(state.youLeaked, p5.width / 2, p5.height / 2)
      }
    } else {
      p5.background(0)

      p5.imageMode(p5.CENTER)
      p5.image(
        this.assets['period-drop.png'],
        state.periodDrop.x,
        state.periodDrop.y,
        state.periodDrop.w,
        state.periodDrop.w
      )

      const catcherWidth =
        state.catcher.catcherWidths[state.catcher.activeCatcher]

      p5.image(
        this.assets[state.catcher.activeCatcher],
        state.catcher.x,
        state.catcher.y,
        catcherWidth,
        150
      )
    }

    // Draw counter
    p5.textSize(24)
    p5.textAlign(p5.LEFT)
    p5.fill(255)
    p5.text(
      `period drops caught: ${state.catchCount}/${state.requiredCatchs}`,
      10,
      30
    )
  }

  /** return true if game is won, false if lost */
  end() {
    return this.state.won
  }
}
