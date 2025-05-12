const DEFAULT_INSTRUCTION = "Ready?";

export class GameManager {
  constructor(container) {
    this.container = container;
    this.libs = {
      p5: new p5((p) => {
        p.setup = () => {
          const canvas = p.createCanvas(800, 600);
          this.canvas = canvas;
          canvas.parent(container);
          p.noLoop(); // Game manager will control looping
        };
      }, container),
    };

    this.games = [];
    this.BUFFER_SIZE = 3; // Keep 3 games loaded at all times
    this.allGameManifests = [];
    this.currentGame = null;
    this.gameTimer = null;
    this.GAME_DURATION = 5000;

    this.showingInstruction = false;
    this.currentInstruction = "";

    this.input = {
      keys: new Set(),
      pressed: (key) => {
        const isPressed = this.input.keys.has(key);
        return isPressed;
      },
    };

    this.state = {
      wins: 0,
      losses: 0,
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
    this.allGameManifests = await res.json(); // todo: consider randomizing
    console.log("Available games:", this.allGameManifests);

    // Initial fill of buffer
    await this.refillBuffer();
  }

  async refillBuffer() {
    while (this.games.length < this.BUFFER_SIZE) {
      // If we're out of manifests, reset the list
      if (this.allGameManifests.length === 0) {
        const res = await fetch("/api/games");
        this.allGameManifests = await res.json();
      }

      // Get next manifest (could be randomized here)
      const nextManifest = this.allGameManifests.shift();
      if (nextManifest) {
        // Pre-load game module and assets
        const [mod, assets] = await Promise.all([
          import(`/games/${nextManifest.name}/index.js`),
          this.loadAssets(nextManifest),
        ]);

        this.games.push({
          manifest: nextManifest,
          module: mod,
          assets: assets,
        });
      }
    }
  }

  async playNext() {
    // Get next game from buffer
    const next = this.games.shift();
    if (!next) {
      console.error("Game buffer empty!");
      return;
    }

    // Start refilling buffer
    this.refillBuffer();

    // Show instruction first
    this.showingInstruction = true;
    console.log("next manifest", next.manifest);
    this.currentInstruction = next.manifest?.instruction || DEFAULT_INSTRUCTION;

    // Initialize game
    this.currentGame = new next.module.default({
      input: this.input,
      assets: next.assets,
      libs: this.libs,
    });

    this.currentGame.init(this.canvas);
    this.startGameLoop();

    // Hide instruction after 1 second
    setTimeout(() => {
      this.showingInstruction = false;
    }, 1000);

    // Automatically end game after time
    this.gameTimer = setTimeout(() => {
      this.endGame(true); // todo: revist win by default
    }, this.GAME_DURATION);
  }

  startGameLoop() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  tick(currentTime = performance.now()) {
    if (!this.isRunning || !this.currentGame) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update current game

    this.currentGame.update?.(deltaTime);

    // Draw instruction overlay if needed
    if (this.showingInstruction) {
      this.drawInstruction();
    }

    // Schedule next frame
    this.frameId = requestAnimationFrame((time) => this.tick(time));
  }

  endGame(won) {
    this.isRunning = false;
    clearTimeout(this.gameTimer);
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    // Call end on current game if it exists
    if (this.currentGame) {
      this.currentGame.end?.();
    }

    // Clean up game state
    this.currentGame = null;

    // Schedule next game
    setTimeout(() => this.playNext(), 1000);
  }

  async loadAssets(manifest) {
    const result = {};
    const basePath = `/games/${manifest.name}/assets/`;

    for (const filename of manifest.assets || []) {
      if (filename.endsWith(".png") || filename.endsWith(".jpg")) {
        const img = new Image();
        img.src = basePath + filename;
        await img.decode();
        result[filename] = await new Promise((resolve) => {
          this.libs.p5.loadImage(basePath + filename, (img) => {
            resolve(img);
          });
        });
      }
      // TODO: add audio/sprite sheet/etc support
    }

    return result;
  }

  drawInstruction() {
    console.log("instru", this.currentInstruction);
    const p5 = this.libs.p5;

    // Save current state
    p5.push();

    // Draw semi-transparent overlay
    p5.fill(0, 150);
    p5.rect(0, 0, p5.width, p5.height);

    // Draw instruction text
    p5.textSize(32);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.fill(255);
    p5.text(this.currentInstruction, p5.width / 2, p5.height / 2);

    // Restore state
    p5.pop();
  }
}
