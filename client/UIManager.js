export class UIManager {
  constructor(container) {
    this.container = container
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

    //     )
    //     .join('')

    //   // add extra backlink if game param exists (currently loading only one game)
    //   const backLink = this.options.game
    //     ? `
    //   <li class="directory-game-entry directory-back-entry">
    //       <a href="/"
    //          class="directory-game-entry"
    //          tabindex="0"
    //          role="button">
    //           <span class="directory-game-name">< Back to all games</span>
    //       </a>
    //   </li>
    // `
    //     : ''

    //   this.directoryOverlay.innerHTML = `
    // <div class="directory-header">
    //     <h2>Available Games (${this.allGameManifests.length})</h2>
    //     <button tabindex="0" class="directory-close-button" onclick="this.closest('.directory-overlay').style.display='none'">×</button>
    // </div>
    // <ul class="directory-games-list">
    //     ${gamesList}
    //     ${backLink}
    // </ul>
    // `
    // }
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
    this.splashOverlay.style.display = 'none'
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
