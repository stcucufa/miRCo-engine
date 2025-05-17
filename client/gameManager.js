const DEFAULT_INSTRUCTION = 'Ready?'

import { Howl } from 'howler'
import p5 from 'p5'

import { GamepadManager, BUTTON_NAMES } from './GamepadManager.js'
import { InputManager } from './InputManager.js'
import { GameLoader } from './GameLoader.js'
import { UIManager } from './UIManager.js'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const DEFAULT_AUTHOR_NAME = 'Someone'
const DEFAULT_BUFFER_SIZE = 3 // Keep 3 games loaded at all times

export class GameManager {
  constructor(container, options = {}) {
    this.container = container
    this.options = options
    this.gameLoopStarted = false

    this.input = new InputManager()

    this.gameLoader = new GameLoader()
    this.ui = new UIManager(container)

    this.libs = {
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

    // this.input = {
    //   keys: new Set(),
    //   gamepad: new GamepadManager(),
    //   isPressedLeft: () =>
    //     this.isDirectionPressed('left') ||
    //     this.input.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_LEFT),
    //   isPressedRight: () =>
    //     this.isDirectionPressed('right') ||
    //     this.input.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_RIGHT),
    //   isPressedUp: () =>
    //     this.isDirectionPressed('up') ||
    //     this.input.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_UP),
    //   isPressedDown: () =>
    //     this.isDirectionPressed('down') ||
    //     this.input.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_DOWN),
    // }

    this.mirco = {
      round: 0,
      wins: 0,
      losses: 0,
    }

    this.ui.buildOverlays(this.container)

    // Bind input handlers
    window.addEventListener('keydown', (e) => this.input.keys.add(e.key))
    window.addEventListener('keyup', (e) => this.input.keys.delete(e.key))
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
       <span class="round">Round: 0</span>
       <span class="wins">Wins: 0</span>
       <span class="losses">Losses: 0</span>
     `
    container.appendChild(this.scoreOverlay)

    // Directory
    this.directoryButton = document.createElement('button')
    this.directoryButton.className = 'directory-button'
    this.directoryButton.textContent = 'All Games'
    this.directoryButton.onclick = () => this.toggleDirectory()
    container.appendChild(this.directoryButton)

    this.directoryOverlay = document.createElement('div')
    this.directoryOverlay.className = 'directory-overlay'
    this.directoryOverlay.style.display = 'none'
    container.appendChild(this.directoryOverlay)
  }

  triggerGameplayStart = () => {
    this.gameLoopStarted = true
    this.ui.hideSplash()
    this.playNext()
  }

  handleSplashInteraction = () => {
    if (!this.gameLoopStarted) {
      // remove all listeners
      window.removeEventListener('click', this.handleSplashInteraction)
      window.removeEventListener('keydown', this.handleSplashInteraction)

      // gamepad listerner will unlisten itself
      this.triggerGameplayStart()
    }
  }

  listenForAnyKeyToStart = () => {
    // Add listeners
    window.addEventListener('click', this.handleSplashInteraction)
    window.addEventListener('keydown', this.handleSplashInteraction)

    // Gamepad input check
    this.waitForGamepadAnyInput()
  }

  waitForGamepadAnyInput = () => {
    if (this.gameLoopStarted) return
    if (this.isAnyGamepadButtonPressed()) {
      this.handleSplashInteraction()
      return
    }
    requestAnimationFrame(this.waitForGamepadAnyInput)
  }

  // toggleDirectory() {
  //   const isVisible = this.directoryOverlay.style.display === 'block'
  //   this.directoryOverlay.style.display = isVisible ? 'none' : 'block'

  //   // disable body scroll when directory open
  //   document.body.style.touchAction = isVisible ? 'auto' : 'none'
  //   this.directoryOverlay.style.touchAction = 'pan-y'

  //   // focus directory and first game on open
  //   if (!isVisible) {
  //     this.directoryOverlay.removeAttribute('tabindex') // no accidental tabbing!

  //     // Focus on directory after a brief delay to ensure DOM is ready
  //     setTimeout(() => {
  //       const dir = this.directoryOverlay.querySelector('.directory-overlay')
  //       if (dir) {
  //         dir.focus()
  //       }
  //     }, 0)
  //   }
  // }

  async init() {
    if (this.options.round) {
      this.mirco.round = parseInt(this.options.round)
      this.scoreOverlay.querySelector('.round').textContent =
        `Round: ${this.mirco.round}`
    }
    if (this.options.suppressSplash) {
      // hide splash, start gameplay
      this.ui.hideSplash()
    } else {
      // add event lister for handling splash
      this.listenForAnyKeyToStart()
    }
    await this.loadGameManifests()

    if (this.options.suppressSplash) {
      // start gameplay rigth away
      this.triggerGameplayStart()
    }
  }

  // isDirectionPressed(direction) {
  //   const validKeys = KEY_MAPPINGS[direction]
  //   if (!validKeys) return false

  //   return validKeys.some((key) => this.input.keys.has(key))
  // }

  isAnyGamepadButtonPressed() {
    return this.input.gamepad.isAnyButtonPressed()
  }

  async loadGameManifests() {
    const res = await fetch('/api/games')
    let manifests = await res.json()
    manifests = [
      ...manifests.filter((m) =>
        this.options.game ? this.options.game === m.name : true
      ),
    ]

    this.BUFFER_SIZE = Math.min(3, manifests.length)

    this.allGameManifests = [...manifests]
    this.gameManifestsQueue = this.shuffleArray([...manifests])

    console.log('Available pending games::', this.gameManifestsQueue)

    // expose all games in directory
    // this.updateDirectory()

    await this.refillBuffer()
  }

  async refillBuffer() {
    while (this.loadedGames.length < this.BUFFER_SIZE) {
      if (this.gameManifestsQueue.length === 0) {
        console.log('Manifests queue empty, resetting manifests')
        this.gameManifestsQueue = this.shuffleArray([...this.allGameManifests])
        this.mirco.round++
        // exit loop if no games are found
        if (this.gameManifestsQueue.length === 0) {
          console.error('No games left to queue. Stopping buffer refill.')
          return
        }
      }

      const nextManifest = this.gameManifestsQueue.shift()
      if (!nextManifest) continue

      try {
        const [mod, assets] = await Promise.all([
          import(`/games/${nextManifest.name}/index.js`),
          this.preloadMusic(nextManifest),
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

    const { p5, images } = await this.bootstrapP5(next.manifest)

    // Initialize game
    this.currentGame = new next.module.default({
      input: this.input,
      mirco: this.mirco,
      assets: { ...next.assets, ...images },
      libs: { ...this.libs, p5 },
    })

    // Show instruction first
    this.showInstruction(next.manifest?.instruction || DEFAULT_INSTRUCTION)
    this.authorOverlay.innerHTML = this.buildAuthorInfoHTML(next.manifest)

    this.currentGame.init(this.canvas)

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
    this.ui.showingInstruction = true
    this.ui.instructionOverlay.textContent = instruction
    this.ui.instructionOverlay.classList.add('visible')

    setTimeout(() => {
      this.ui.showingInstruction = false
      this.ui.instructionOverlay.classList.remove('visible')
    }, duration)
  }

  hideInstruction() {
    this.ui.showingInstruction = false
    this.ui.instructionOverlay.classList.remove('visible')
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
      this.currentGame.libs.p5.remove()
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
      this.mirco.wins++
    } else {
      this.mirco.losses++
    }
    this.scoreOverlay.querySelector('.round').textContent =
      `Round: ${this.mirco.round}`
    this.scoreOverlay.querySelector('.wins').textContent =
      `Wins: ${this.mirco.wins}`
    this.scoreOverlay.querySelector('.losses').textContent =
      `Losses: ${this.mirco.losses}`
  }

  resetTimer() {
    this.timerProgress.style.transition = 'none'
    this.timerProgress.style.width = '100%'
  }

  async bootstrapP5(manifest) {
    const theP5 = new p5((p) => {
      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        this.canvas = canvas
        canvas.parent(this.container)
        p.noLoop() // game manager will control looping
      }
    }, this.container)
    const images = await this.loadImages(manifest, theP5)

    theP5.setup()

    return { p5: theP5, images }
  }

  assetConf(conf) {
    let filename, options

    if (typeof conf === 'string') {
      filename = conf
      options = {}
    } else {
      const { file, ...rest } = conf
      filename = file
      options = rest
    }

    return { filename, options }
  }

  async loadImages(manifest, p5) {
    const result = {}
    const basePath = `/games/${manifest.name}/assets/`

    for (const conf of manifest.assets || []) {
      const { filename } = this.assetConf(conf)

      if (!filename) {
        console.warn(`Unable to load asset for game ${manifest.name}`, conf)
        continue
      }

      if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
        const img = new Image()
        img.src = basePath + filename
        await img.decode()
        result[filename] = await new Promise((resolve) => {
          p5.loadImage(basePath + filename, (img) => {
            resolve(img)
          })
        })
      }
      // TODO: add audio/sprite sheet/etc support
    }

    return result
  }

  async preloadMusic(manifest) {
    const result = {}
    const basePath = `/games/${manifest.name}/assets/`

    for (const conf of manifest.assets || []) {
      const { filename, options } = this.assetConf(conf)

      if (!filename) {
        console.warn(`Unable to load asset for game ${manifest.name}`, conf)
        continue
      }

      if (filename.endsWith('.mp3') || filename.endsWith('.wav')) {
        result[filename] = new Howl({
          src: [basePath + filename],
          preload: true,
          ...options,
        })
        // Wait for sound to load
        await new Promise((resolve, reject) => {
          result[filename].once('load', resolve)
          result[filename].once('loaderror', reject)
        })
      }
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
