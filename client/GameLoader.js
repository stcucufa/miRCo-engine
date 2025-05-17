export class GameLoader {
  constructor(bufferSize = 3) {
    this.BUFFER_SIZE = bufferSize
    this.loadedGames = []
    this.gameManifestsQueue = []
    this.allGameManifests = []
  }

  async loadGameManifests(apiUrl, options) {
    const res = await fetch(apiUrl)
    let manifests = await res.json()
    manifests = manifests.filter((m) =>
      options.game ? options.game === m.name : true
    )

    this.BUFFER_SIZE = Math.min(3, manifests.length)
    this.allGameManifests = [...manifests]
    this.gameManifestsQueue = this.shuffleArray([...manifests])
  }

  async refillBuffer() {
    while (this.loadedGames.length < this.BUFFER_SIZE) {
      if (this.gameManifestsQueue.length === 0) {
        this.gameManifestsQueue = this.shuffleArray([...this.allGameManifests])
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

  shuffleArray(arr) {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
