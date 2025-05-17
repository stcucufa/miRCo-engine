export class UIManager {
  constructor(container) {
    this.container = container
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
    this.timerOverlay = this.createOverlay(
      'timer-overlay',
      `
        <div class="timer-progress"></div>
      `
    )
    this.scoreOverlay = this.createOverlay(
      'score-overlay',
      `
        <span class="round">Round: 0</span>
        <span class="wins">Wins: 0</span>
        <span class="losses">Losses: 0</span>
      `
    )
    // TODO: ADD DIRECTORY OVERLAY
    // this.directoryButton = document.createElement('button')
    // this.directoryButton.className = 'directory-button'
    // this.directoryButton.textContent = 'All Games'
    // this.directoryButton.onclick = () => this.toggleDirectory()
    // container.appendChild(this.directoryButton)

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
    console.log('showing splash')
    this.splashOverlay.style.display = 'flex'
  }

  hideSplash() {
    console.log('hiding splash')
    console.log(this.splashOverlay)
    this.splashOverlay.style.display = 'none !important'
  }
}
