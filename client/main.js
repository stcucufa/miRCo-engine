import { MircoEngine } from './MircoEngine.js'

function getQueryParams() {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(location.search)
  return {
    game: params.get('game'),
    round: params.get('round'),
    suppressSplash: !!params.get('suppress-splash')?.match(/true/i),
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#game-container')
  if (!container) {
    throw new Error('Game container element not found')
  }

  const options = getQueryParams()

  const gameManager = new MircoEngine(container, options)
  gameManager.init()
})
