import { GameManager } from './gameManager.js'

function gameNameFromQuery() {
  if (typeof window === undefined) return null

  return new URLSearchParams(location.search).get('game')
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#game-container')
  if (!container) {
    throw new Error('Game container element not found')
  }

  const gameManager = new GameManager(container, { game: gameNameFromQuery() })
  gameManager.init()
})
