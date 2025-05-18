export class UIManager {
  constructor(container, gameDuration = 5000) {
    this.container = container
    this.GAME_DURATION = gameDuration
    this.gameTimer = null
    this.onTimeUp = null
    this.showingInstruction = false
    this.currentInstruction = ''
    this.DEFAULT_INSTRUCTION = 'Ready?'

    this.buildOverlays()
  }

  buildOverlays() {
    this.splashOverlay = this.createOverlay(
      'start-splash-overlay',
      `
        <div class="splash-content">
          <h1>miRCo Engine</h1>
          <button class="start-button">START</button>
        </div>
      `
    )

    this.instructionOverlay = this.createOverlay('instruction-overlay')

    this.authorOverlay = this.createOverlay('author-overlay')

    this.timerOverlay = document.createElement('div')
    this.timerOverlay.className = 'timer-overlay'
    this.timerProgress = document.createElement('div')
    this.timerProgress.className = 'timer-progress'
    this.timerOverlay.appendChild(this.timerProgress)
    this.container.appendChild(this.timerOverlay)

    this.scoreOverlay = this.createOverlay(
      'score-overlay',
      `
        <span class="round">Round: 0</span>
        <span class="wins">Wins: 0</span>
        <span class="losses">Losses: 0</span>
      `
    )
    // TODO: ADD DIRECTORY OVERLAY
    this.directoryButton = document.createElement('button')
    this.directoryButton.className = 'directory-button'
    this.directoryButton.textContent = 'All Games'
    this.directoryButton.onclick = () => this.toggleDirectory()
    this.container.appendChild(this.directoryButton)

    // this.directoryOverlay = document.createElement('div')
    // this.directoryOverlay.className = 'directory-overlay'
    // this.directoryOverlay.style.display = 'none'
    // container.appendChild(this.directoryOverlay)

    this.directoryOverlay = this.createOverlay('directory-overlay')
  }

  createOverlay(className, innerHTML = '') {
    const overlay = document.createElement('div')
    overlay.className = className
    overlay.innerHTML = innerHTML
    this.container.appendChild(overlay)
    return overlay
  }

  showSplash() {
    this.splashOverlay.style.display = 'flex'
  }

  hideSplash() {
    this.splashOverlay.style.display = 'none'
  }

  showGameInfo(manifest, authorNameFallback = 'Someone') {
    this.showInstruction(manifest?.instruction || this.DEFAULT_INSTRUCTION)

    this.authorOverlay.innerHTML = this.buildAuthorInfoHTML(
      manifest,
      authorNameFallback
    )
  }

  showInstruction(instruction, duration = 1000) {
    this.showingInstruction = true
    this.currentInstruction = instruction
    this.instructionOverlay.textContent = instruction
    this.instructionOverlay.classList.add('visible')

    setTimeout(() => {
      this.hideInstruction()
    }, duration)
  }

  hideInstruction() {
    this.showingInstruction = false
    this.instructionOverlay.classList.remove('visible')
  }

  toggleDirectory() {
    const isVisible = this.directoryOverlay.style.display === 'block'
    this.directoryOverlay.style.display = isVisible ? 'none' : 'block'

    // disable body scroll when directory open
    document.body.style.touchAction = isVisible ? 'auto' : 'none'

    // focus directory and first game on open
    if (!isVisible) {
      this.directoryOverlay.removeAttribute('tabindex') // no accidental tabbing!

      // Focus on directory after a brief delay to ensure DOM is ready
      setTimeout(() => {
        const dir = this.directoryOverlay.querySelector('.directory-overlay')
        if (dir) {
          dir.focus()
        }
      }, 0)
    }
  }

  startTimer(onTimeUp) {
    this.resetTimer()
    this.onTimeUp = onTimeUp

    // Force reflow to ensure transition reset takes effect
    this.timerProgress.offsetHeight

    // Start timer animation
    this.timerProgress.style.transition = `width ${this.GAME_DURATION}ms linear`
    this.timerProgress.style.width = '0%'
  }

  resetTimer() {
    clearTimeout(this.gameTimer)
    this.gameTimer = null
    this.timerProgress.style.transition = 'none'
    this.timerProgress.style.width = '100%'
  }

  buildAuthorInfoHTML(manifest, defaultAuthorName) {
    if (!manifest) {
      return `game by ${defaultAuthorName}`
    }
    return `${manifest?.name} by ${
      manifest?.authorLink
        ? `<a href="${manifest.authorLink}" target="_blank">${manifest.author || defaultAuthorName}</a>`
        : manifest?.author || defaultAuthorName
    }`
  }
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
