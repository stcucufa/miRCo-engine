const DEFAULT_INSTRUCTION = 'Ready?'

import { Howl } from 'howler'
import p5 from 'p5'
import { BUTTON_NAMES, BUTTON_MAPPINGS } from './gamepadManager.js'

const DEFAULT_AUTHOR_NAME = 'Someone'
const DEFAULT_BUFFER_SIZE = 3 // Keep 3 games loaded at all times
const KEY_MAPPINGS = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
}

export class GameManager {
  constructor(container, options = {}) {
    this.container = container
    this.onlyGame = options.game
    this.gameLoopStarted = false

    this.libs = {
      p5: new p5((p) => {
        p.setup = () => {
          const canvas = p.createCanvas(800, 600)
          this.canvas = canvas
          canvas.parent(container)
          p.noLoop() // game manager will control looping
        }
      }, container),
      sound: {
        play: (sound) => {
          if (sound instanceof Howl) {
            sound.play()
          }
        },
        stop: (sound) => {
          if (sound instanceof Howl) {
            sound.stop()
          }
        },
      },
    }

    this.BUFFER_SIZE = DEFAULT_BUFFER_SIZE
    this.loadedGames = []
    this.gameManifestsQueue = []
    this.allGameManifests = []
    this.currentGame = null

    this.gameTimer = null
    this.GAME_DURATION = 5000

    this.showingInstruction = false
    this.currentInstruction = ''

    this.input = {
      keys: new Set(),
      isPressedLeft: () => {
        if (this.isDirectionPressed('left')) {
          return true
        }

        if (this.isGamepadButtonPressed(BUTTON_NAMES.DPAD_LEFT)) {
          return true
        }
        return false
      },
      isPressedRight: () => {
        if (this.isDirectionPressed('right')) {
          return true
        }

        if (this.isGamepadButtonPressed(BUTTON_NAMES.DPAD_RIGHT)) {
          return true
        }
        return false
      },
      isPressedUp: () => {
        if (this.isDirectionPressed('up')) {
          return true
        }
        if (this.isGamepadButtonPressed(BUTTON_NAMES.DPAD_UP)) {
          return true
        }
        return false
      },
      isPressedDown: () => {
        if (this.isDirectionPressed('down')) {
          return true
        }

        if (this.isGamepadButtonPressed(BUTTON_NAMES.DPAD_DOWN)) {
          return true
        }
        return false
      },

      // gamepad support
      gamepads: [],
      hasGamepad: () => {
        if ((!'getGamepads') in navigator) {
          return false
        }
        // Check if any gamepad is connected
        if (this.input.gamepads === undefined || this.input.gamepads === null) {
          return false
        }
        return this.input.gamepads.length > 0
      },
      updateGamepadState: () => {
        const gamepads = navigator.getGamepads()
        for (const gamepad of gamepads) {
          if (gamepad) {
            this.input.gamepads[gamepad.index] = gamepad
          }
        }
        requestAnimationFrame(this.input.updateGamepadState)
      },
    }

    this.state = {
      wins: 0,
      losses: 0,
    }

    this.buildOverlays(this.container)

    // Bind input handlers
    window.addEventListener('keydown', (e) => this.input.keys.add(e.key))
    window.addEventListener('keyup', (e) => this.input.keys.delete(e.key))

    // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    if ('getGamepads' in navigator) {
      window.addEventListener(
        'gamepadconnected',
        (e) => {
          //this.gamepadHandler(e, true);
          console.log(
            'Gamepad connected at index %d: %s. %d buttons, %d axes.',
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length
          )
          const gamepad = e.gamepad
          console.log('gamepad', gamepad)
          console.log('this.gamepads', this.input.gamepads)
          this.input.gamepads[gamepad.index] = gamepad
        },
        false
      )

      window.addEventListener(
        'gamepaddisconnected',
        (e) => {
          //this.gamepadHandler(e, false);
          console.log(
            'Gamepad disconnected from index %d: %s',
            e.gamepad.index,
            e.gamepad.id
          )

          const gamepad = e.gamepad
          delete this.input.gamepads[gamepad.index]
        },
        false
      )

      // Contiously poll for gamepad state
      this.input.updateGamepadState()
    }
  }

  buildOverlays(container) {
    // Splash overlay
    this.splashOverlay = document.createElement('div')
    this.splashOverlay.className = 'start-splash-overlay'
    this.splashOverlay.innerHTML = `
        <div class="splash-content">
          <h1>miRCo Engine</h1>
          <button class="start-button">START</button>
        </div>
      `
    container.appendChild(this.splashOverlay)
    this.listenForAnyKeyToStart()

    // Instructions overlay
    this.instructionOverlay = document.createElement('div')
    this.instructionOverlay.className = 'instruction-overlay'
    container.appendChild(this.instructionOverlay)

    // Author info
    this.authorOverlay = document.createElement('div')
    this.authorOverlay.className = 'author-overlay'
    container.appendChild(this.authorOverlay)

    // Timer
    this.timerOverlay = document.createElement('div')
    this.timerOverlay.className = 'timer-overlay'
    this.timerProgress = document.createElement('div')
    this.timerProgress.className = 'timer-progress'
    this.timerOverlay.appendChild(this.timerProgress)
    container.appendChild(this.timerOverlay)

    // Scoreboard
    this.scoreOverlay = document.createElement('div')
    this.scoreOverlay.className = 'score-overlay'
    this.scoreOverlay.innerHTML = `
       <span class="wins">Wins: 0</span>
       <span class="losses">Losses: 0</span>
     `
    container.appendChild(this.scoreOverlay)
  }

  listenForAnyKeyToStart() {
    window.addEventListener('click', () => {
      if (!this.gameLoopStarted) {
        this.handleStartButtonInteraction()
      }
    })
    window.addEventListener('keydown', () => {
      if (!this.gameLoopStarted) {
        this.handleStartButtonInteraction()
      }
    })
    // Gamepad input check - TODO: not DRY - merge with existing gamepad manager
    const checkGamepadInput = () => {
      if (!this.gameLoopStarted) {
        // check all connected gamepads
        for (const gamepad of this.input.gamepads) {
          if (!gamepad) continue

          // check all buttons
          if (gamepad.buttons.some((button) => button.pressed)) {
            this.handleStartButtonInteraction()
            return
          }

          // check all axes
          if (gamepad.axes.some((axis) => Math.abs(axis) > 0.5)) {
            this.handleStartButtonInteraction()
            return
          }
        }
        // continue checking if game hasn't started
        requestAnimationFrame(checkGamepadInput)
      }
    }

    // Start checking for gamepad input
    checkGamepadInput()
  }

  handleStartButtonInteraction() {
    this.gameLoopStarted = true
    this.hideSplash()
    this.playNext()
  }

  showSplash() {
    this.splashOverlay.style.display = 'flex'
  }

  hideSplash() {
    this.splashOverlay.style.display = 'none'
  }

  async gamepadHandler(event, connected) {
    const gamepad = event.gamepad
    // Note:
    //gamepad === navigator.getGamepads()[gamepad.index]

    if (connected) {
      console.log(
        'Gamepad connected at index %d: %s. %d buttons, %d axes.',
        event.gamepad.index,
        event.gamepad.id,
        event.gamepad.buttons.length,
        event.gamepad.axes.length
      )
      this.gamepads[gamepad.index] = gamepad
    } else {
      console.log(
        'Gamepad disconnected from index %d: %s',
        e.gamepad.index,
        e.gamepad.id
      )

      delete this.gamepads[gamepad.index]
    }
  }

  async init() {
    await this.loadGameManifests()
  }

  isDirectionPressed(direction) {
    const validKeys = KEY_MAPPINGS[direction]
    if (!validKeys) return false

    return validKeys.some((key) => this.input.keys.has(key))
  }

  // TODO these gamepad functions need to accouunt for the actual gamepad in use, maybe by name or type?
  isGamepadButtonPressed(button_name) {
    if (!this.input.hasGamepad()) {
      return false
    }
    for (const gamepad of this.input.gamepads) {
      if (!gamepad) continue

      var mappings
      if (BUTTON_MAPPINGS.has(gamepad.id)) {
        mappings = BUTTON_MAPPINGS.get(gamepad.id)
      } else {
        mappings = BUTTON_MAPPINGS.get('default')
      }

      const x = mappings.get(button_name)
      if (gamepad.buttons.length >= x) {
        if (gamepad.buttons[x].pressed) {
          return true
        }
      }
    }
    return false
  }

  async loadGameManifests() {
    const res = await fetch('/api/games')
    let manifests = await res.json()
    manifests = [
      ...manifests.filter((m) =>
        this.onlyGame ? this.onlyGame === m.name : true
      ),
    ]

    this.BUFFER_SIZE = Math.min(3, manifests.length)

    this.allGameManifests = [...manifests]
    this.gameManifestsQueue = this.shuffleArray([...manifests])

    console.log('Available pending games::', this.gameManifestsQueue)
    // Initial fill of buffer
    await this.refillBuffer()
  }

  async refillBuffer() {
    while (this.loadedGames.length < this.BUFFER_SIZE) {
      if (this.gameManifestsQueue.length === 0) {
        console.log('Manifests queue empty, resetting manifests')
        this.gameManifestsQueue = this.shuffleArray([...this.allGameManifests])
      }

      const nextManifest = this.gameManifestsQueue.shift()
      if (!nextManifest) continue

      try {
        const [mod, assets] = await Promise.all([
          import(`/games/${nextManifest.name}/index.js`),
          this.loadAssets(nextManifest),
        ])

        this.loadedGames.push({
          manifest: nextManifest,
          module: mod,
          assets,
        })
      } catch (err) {
        console.error(`Failed to load ${nextManifest.name}:`, err)
      }
    }
  }

  async playNext() {
    let next = this.loadedGames.shift()
    if (!next) {
      console.error('Game buffer empty! Refilling...')
      await this.refillBuffer()
      next = this.loadedGames.shift()
      if (!next) {
        console.error('Still no games after refill')
        return
      }
    }

    // Initialize game
    this.currentGame = new next.module.default({
      input: this.input,
      assets: next.assets,
      libs: this.libs,
    })

    this.currentGame.init(this.canvas)

    // Show instruction
    this.showInstruction(next.manifest?.instruction || DEFAULT_INSTRUCTION)
    this.authorOverlay.innerHTML = this.buildAuthorInfoHTML(next.manifest)

    this.startGameLoop()

    // Start refilling buffer asynchronously
    this.refillBuffer().catch((err) =>
      console.error('Failed to refill buffer:', err)
    )

    // Automatically end game after time
    this.gameTimer = setTimeout(() => {
      this.endGame(true) // todo: revist win by default
    }, this.GAME_DURATION)
  }

  showInstruction(instruction, duration = 1000) {
    this.showingInstruction = true
    this.instructionOverlay.textContent = instruction
    this.instructionOverlay.classList.add('visible')

    setTimeout(() => {
      this.showingInstruction = false
      this.instructionOverlay.classList.remove('visible')
    }, duration)
  }

  hideInstruction() {
    this.showingInstruction = false
    this.instructionOverlay.classList.remove('visible')
  }

  shuffleArray(arr) {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  startGameLoop() {
    this.isRunning = true
    this.lastTime = performance.now()
    this.tick()
    this.startTimer()
  }

  stopGameLoop() {
    this.isRunning = false
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  tick(currentTime = performance.now()) {
    if (!this.isRunning || !this.currentGame) return

    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // Update current game
    this.currentGame.update?.(deltaTime)

    // Schedule next frame
    this.frameId = requestAnimationFrame((time) => this.tick(time))
  }

  endGame(won) {
    this.isRunning = false
    clearTimeout(this.gameTimer)
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    // Call end on current game if it exists
    if (this.currentGame) {
      won = this.currentGame.end?.() || false
      this.updateScore(won)

      // Clean up game assets
      if (this.currentGame.assets) {
        Object.values(this.currentGame.assets).forEach((asset) => {
          // Dispose of Howl audio
          if (asset instanceof Howl) {
            asset.unload()
          }
        })
      }
      this.currentGame = null
    }

    // reset timer
    this.resetTimer()

    // Schedule next game
    setTimeout(() => this.playNext(), 1000)
  }

  startTimer() {
    this.resetTimer()

    // Force reflow to ensure transition reset takes effect
    this.timerProgress.offsetHeight

    // Start timer animation
    this.timerProgress.style.transition = `width ${this.GAME_DURATION}ms linear`
    this.timerProgress.style.width = '0%'
  }

  updateScore(won) {
    if (won) {
      this.state.wins++
    } else {
      this.state.losses++
    }
    this.scoreOverlay.querySelector('.wins').textContent =
      `Wins: ${this.state.wins}`
    this.scoreOverlay.querySelector('.losses').textContent =
      `Losses: ${this.state.losses}`
  }

  resetTimer() {
    this.timerProgress.style.transition = 'none'
    this.timerProgress.style.width = '100%'
  }

  async loadAssets(manifest) {
    const result = {}
    const basePath = `/games/${manifest.name}/assets/`

    for (const filename of manifest.assets || []) {
      if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
        const img = new Image()
        img.src = basePath + filename
        await img.decode()
        result[filename] = await new Promise((resolve) => {
          this.libs.p5.loadImage(basePath + filename, (img) => {
            resolve(img)
          })
        })
      } else if (filename.endsWith('.mp3') || filename.endsWith('.wav')) {
        result[filename] = new Howl({
          src: [basePath + filename],
          preload: true,
        })
        // Wait for sound to load
        await new Promise((resolve, reject) => {
          result[filename].once('load', resolve)
          result[filename].once('loaderror', reject)
        })
      }
      // TODO: add audio/sprite sheet/etc support
    }

    return result
  }

  buildAuthorInfoHTML(manifest) {
    // probably never enter this state
    if (!manifest) {
      return `game by ${DEFAULT_AUTHOR_NAME}`
    }
    return `${manifest?.name} by ${
      manifest?.authorLink
        ? `<a href="${manifest.authorLink}" target="_blank">${manifest.author || DEFAULT_AUTHOR_NAME}</a>`
        : manifest?.author || DEFAULT_AUTHOR_NAME
    }`
  }
}
