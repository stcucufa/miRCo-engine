import { GameManager } from './GameManager.js'

function gameNameFromQuery() {
  if (typeof window === undefined) return null

  return new URLSearchParams(location.search).get('game')
}

function roundFromQuery() {
  if (typeof window === undefined) return null

  return new URLSearchParams(location.search).get('round')
}

function supressSplashFromQuery() {
  if (typeof window === undefined) return null
  const val = new URLSearchParams(location.search).get('suppress-splash')
  return !!val?.match(/true/i)
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#game-container')
  if (!container) {
    throw new Error('Game container element not found')
  }

  const gameManager = new GameManager(container, {
    game: gameNameFromQuery(),
    suppressSplash: supressSplashFromQuery(),
    round: roundFromQuery(),
  })
  gameManager.init()
})
