const DEFAULT_INSTRUCTION = "Ready?";

import { Howl } from "howler";

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
      sound: {
        play: (sound) => {
          if (sound instanceof Howl) {
            sound.play();
          }
        },
        stop: (sound) => {
          if (sound instanceof Howl) {
            sound.stop();
          }
        },
      },
    };

    this.games = [];
    this.BUFFER_SIZE = 3; // Keep 3 games loaded at all times
    this.allGameManifests = [];
    this.originalManifests = [];
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

    /** Build overlays */
    this.instructionOverlay = document.createElement("div");
    this.instructionOverlay.className = "instruction-overlay";
    this.container.appendChild(this.instructionOverlay);

    // Author info
    this.authorOverlay = document.createElement("div");
    this.authorOverlay.className = "author-overlay";
    this.container.appendChild(this.authorOverlay);

    // Timer
    this.timerOverlay = document.createElement("div");
    this.timerOverlay.className = "timer-overlay";
    this.timerProgress = document.createElement("div");
    this.timerProgress.className = "timer-progress";
    this.timerOverlay.appendChild(this.timerProgress);
    this.container.appendChild(this.timerOverlay);

    // Scoreboard
    this.scoreOverlay = document.createElement("div");
    this.scoreOverlay.className = "score-overlay";
    this.scoreOverlay.innerHTML = `
      <span class="wins">Wins: 0</span>
      <span class="losses">Losses: 0</span>
    `;
    this.container.appendChild(this.scoreOverlay);

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

    const manifests = await res.json();
    // deep copies
    this.originalManifests = JSON.parse(JSON.stringify(manifests));
    this.allGameManifests = JSON.parse(JSON.stringify(manifests));

    console.log("Available games:", this.allGameManifests);
    // Initial fill of buffer
    await this.refillBuffer();
  }

  async refillBuffer() {
    while (this.games.length < this.BUFFER_SIZE) {
      // If we're out of manifests, reset the list
      if (this.allGameManifests.length === 0) {
        this.allGameManifests = JSON.parse(
          JSON.stringify(this.originalManifests)
        );

        // Shuffle the array
        for (let i = this.allGameManifests.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.allGameManifests[i], this.allGameManifests[j]] = [
            this.allGameManifests[j],
            this.allGameManifests[i],
          ];
        }
      }

      // Get next manifest (could be randomized here)
      const nextManifest = this.allGameManifests.shift();
      if (nextManifest) {
        // Pre-load game module and assets
        const [mod, assets] = await Promise.all([
          /* @vite-ignore */
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
    console.log("all game manifests", JSON.stringify(this.allGameManifests));
    // Get next game from buffer
    const next = this.games.shift();
    if (!next) {
      console.error("Game buffer empty!");
      return;
    }

    // Start refilling buffer
    this.refillBuffer();

    console.log("nxt manifest", next.manifest);
    // Show instruction first
    this.showInstruction(next.manifest?.instruction || DEFAULT_INSTRUCTION);

    this.authorOverlay.textContent = `by ${
      next.manifest?.author || "Anonymous"
    }`;

    // Initialize game
    this.currentGame = new next.module.default({
      input: this.input,
      assets: next.assets,
      libs: this.libs,
    });

    this.currentGame.init(this.canvas);
    this.startGameLoop();

    this.startTimer();

    // Automatically end game after time
    this.gameTimer = setTimeout(() => {
      this.endGame(true); // todo: revist win by default
    }, this.GAME_DURATION);
  }

  showInstruction(instruction, duration = 1000) {
    this.showingInstruction = true;
    this.instructionOverlay.textContent = instruction;
    this.instructionOverlay.classList.add("visible");

    setTimeout(() => {
      this.showingInstruction = false;
      this.instructionOverlay.classList.remove("visible");
    }, duration);
  }

  hideInstruction() {
    this.showingInstruction = false;
    this.instructionOverlay.classList.remove("visible");
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
      won = this.currentGame.end?.() || false;
      this.updateScore(won);
    }

    // Clean up game state
    this.currentGame = null;

    // reset timer
    this.resetTimer();

    // Schedule next game
    setTimeout(() => this.playNext(), 1000);
  }

  startTimer() {
    this.resetTimer();

    // Force reflow to ensure transition reset takes effect
    this.timerProgress.offsetHeight;

    // Start timer animation
    this.timerProgress.style.transition = `width ${this.GAME_DURATION}ms linear`;
    this.timerProgress.style.width = "0%";
  }

  updateScore(won) {
    if (won) {
      this.state.wins++;
    } else {
      this.state.losses++;
    }
    this.scoreOverlay.querySelector(
      ".wins"
    ).textContent = `Wins: ${this.state.wins}`;
    this.scoreOverlay.querySelector(
      ".losses"
    ).textContent = `Losses: ${this.state.losses}`;
  }

  resetTimer() {
    this.timerProgress.style.transition = "none";
    this.timerProgress.style.width = "100%";
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
      } else if (filename.endsWith(".mp3") || filename.endsWith(".wav")) {
        result[filename] = new Howl({
          src: [basePath + filename],
          preload: true,
        });
        // Wait for sound to load
        await new Promise((resolve, reject) => {
          result[filename].once("load", resolve);
          result[filename].once("loaderror", reject);
        });
      }
      // TODO: add audio/sprite sheet/etc support
    }

    return result;
  }
}
