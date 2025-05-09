export class GameManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.games = [];
    this.currentGame = null;

    this.input = {
      keys: new Set(),
      pressed: (key) => {
        const isPressed = this.input.keys.has(key);
        console.log(`Checking key ${key}: ${isPressed}`);
        return isPressed;
      },
    };

    // Bind input handlers
    window.addEventListener("keydown", (e) => this.input.keys.add(e.key));
    window.addEventListener("keyup", (e) => this.input.keys.delete(e.key));
  }

  async init() {
    await this.loadGames();
    this.playNext();
  }

  async loadGames() {
    const res = await fetch("/api/games");
    const games = await res.json();
    console.log({ games });
    this.games = games;
  }

  async playNext() {
    const next = this.games.shift(); // could also randomize
    if (!next) {
      // TODO: inifinitely loop games
      console.log("No more games!");
      return;
    }

    console.log({ next });

    const mod = await import(`/games/${next.name}/index.js`);
    const assets = await this.loadAssets(next);

    this.currentGame = new mod.default({
      canvas: this.canvas,
      assets,
      input: this.input,
      win: () => this.endGame(true),
      lose: () => this.endGame(false),
    });

    this.currentGame.init?.();
    this.currentGame.start?.();

    const loop = (timestamp) => {
      if (!this.currentGame) return;
      this.currentGame.update?.(16); // naive dt, ideally use actual delta
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Automatically end game after time
    setTimeout(() => {
      this.endGame(true); // consider as win by default
    }, TIMER_DURATION);
  }

  endGame(won) {
    this.currentGame?.end?.();
    this.currentGame = null;
    setTimeout(() => this.playNext(), 1000); // Add transition delay
  }

  async loadAssets(manifest) {
    const result = {};
    const basePath = `/games/${manifest.name}/assets/`;

    for (const filename of manifest.assets || []) {
      if (filename.endsWith(".png") || filename.endsWith(".jpg")) {
        const img = new Image();
        img.src = basePath + filename;
        await img.decode();
        result[filename] = img;
      }
      // TODO: add audio/sprite sheet/etc support
    }

    return result;
  }
}
