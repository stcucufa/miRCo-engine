const DEFAULT_AUTHOR_NAME = 'Someone'

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
    // START SPLASH
    this.splashOverlay = this.createOverlay(
      'start-splash-overlay',
      `
        <div class="splash-content">
          <h1>miRCo Engine</h1>
          <button class="start-button">START</button>
        </div>
      `
    )

    // GAME INFO
    this.instructionOverlay = this.createOverlay('instruction-overlay')
    this.authorOverlay = this.createOverlay('author-overlay')

    // TIMER
    this.timerOverlay = document.createElement('div')
    this.timerOverlay.className = 'timer-overlay'
    this.timerProgress = document.createElement('div')
    this.timerProgress.className = 'timer-progress'
    this.timerOverlay.appendChild(this.timerProgress)
    this.container.appendChild(this.timerOverlay)

    // SCOREBOARD
    this.scoreOverlay = this.createOverlay(
      'score-overlay',
      `
        <span class="round">Round: 0</span>
        <span class="wins">Wins: 0</span>
        <span class="losses">Losses: 0</span>
      `
    )
    // DIRECTORY
    this.directoryButton = document.createElement('button')
    this.directoryButton.className = 'directory-button'
    this.directoryButton.textContent = 'All Games'
    this.directoryButton.onclick = () => this.toggleDirectory()
    this.container.appendChild(this.directoryButton)

    this.directoryOverlay = document.createElement('div')
    this.directoryOverlay.className = 'directory-overlay'
    this.directoryOverlay.style.display = 'none'
    this.container.appendChild(this.directoryOverlay)
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

  showErrorPlayingGame(gameName = 'game'){
    const error = this.createOverlay('error-splash-overlay', this.buildErrorInfoHTML(gameName))
    setTimeout(()=> error.remove(), 3000)
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

  updateDirectory(allGameManifests, options) {
    // sort games alphabetically by name
    const sortedGames = [...allGameManifests].sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    const gamesList = sortedGames
      .map(
        (game) => `
          <li class="directory-game-entry">
              <a href="?game=${game.name}" 
                   class="directory-game-entry" 
                   tabindex="0"
                   data-game="${game.name}"
                   role="button">
                    <span class="directory-game-name">${game.name}</span>
                    <span class="directory-game-author">by ${game.author || DEFAULT_AUTHOR_NAME}</span>
                </a>
          </li>
      `
      )
      .join('')

    // add extra backlink if game param exists (currently loading only one game)
    const backLink = options.game
      ? `
    <li class="directory-game-entry directory-back-entry">
        <a href="/" 
           class="directory-game-entry" 
           tabindex="0"
           role="button">
            <span class="directory-game-name">< Back to all games</span>
        </a>
    </li>
  `
      : ''

    this.directoryOverlay.innerHTML = `
      <div class="directory-header">
          <h2>Available Games (${allGameManifests.length})</h2>
          <button tabindex="0" class="directory-close-button" onclick="this.closest('.directory-overlay').style.display='none'">×</button>
      </div>
      <ul class="directory-games-list">
          ${gamesList}
          ${backLink}
      </ul>
  `
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

  buildErrorInfoHTML(gameName){
    return `<div class="error-splash-content"><h2>Oh no there was an error playing ${gameName}! <br>
    onto the next </h2></div>`
  }

  buildAuthorInfoHTML(manifest) {
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
