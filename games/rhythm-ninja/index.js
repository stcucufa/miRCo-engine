export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input;
    this.assets = assets;
    this.libs = libs;
    this.state = {
      gameOver: false,
      won: true,
    };
  }

  init(canvas) {
    const p5 = this.libs.p5;
    p5.noStroke();
    this.state = {
      foods: [
        "banana_1f34c.png",
        "cooked-rice_1f35a.png",
        "curry-and-rice_1f35b.png",
        "fish-cake-with-swirl-design_1f365.png",
        "fried-shrimp_1f364.png",
        "grapes_1f347.png",
        "green-apple_1f34f.png",
        "lemon_1f34b.png",
        "melon_1f348.png",
        "pear_1f350.png",
        "pineapple_1f34d.png",
        "red-apple_1f34e.png",
        "rice-ball_1f359.png",
        "rice-cracker_1f358.png",
        "steaming-bowl_1f35c.png",
        "sushi_1f363.png",
        "tangerine_1f34a.png",
        "watermelon_1f349.png",
      ],
      score: 0,
      lastPressTime: 0,
      pressed: false,
      bpm: 280,
      notes: [],
      baseNote: {
        pos: [100, 300],
        vel: [350, -300],
        acc: [0, 350],
        rot: 0,
      },
      startTime: performance.now(),
      beatTime: 0,
    };
  }

  update(dt) {
    const justPressed = getJustPressed();
    const timeNow = performance.now();
    const timeSince = timeNow - this.state.startTime;
    const beatsSince = timeSince * this.beatsPerMs();
    this.state.beatTime = (beatsSince / 2) % 1;
    if (this.state.notes.length < 8 && beatsSince > this.state.notes.length) {
      const note = Math.random() > 0.5 ? false : this.newBeat();
      if (note) {
        this.libs.sound.play(this.assets["tick.mp3"]);
      }
      this.state.notes.push(note);
    }

    if (justPressed) {
      if (this.lastPressTime + 0.5 / this.beatsPerMs() < timeNow) {
        // - [ ] on click, if beat nearby, +1
        // find last beat, if its close enough, use, else if its passed, find second to last beat
        // on use, change its state,
        this.score += 1;
      }
      this.lastPressTime = timeNow;
    }

    this.state.notes = this.state.notes.map((note) => {
      if (note === false) return false;
      if (timeNow > note.endTime) {
        note.vel = [0, 0];
        note.acc = [0, 0];
        return note;
      }
      return this.processPhysics(note, dt);
    });

    this.draw();
  }

  draw() {
    const timeNow = performance.now();
    const p5 = this.libs.p5;
    p5.background(255);
    p5.fill(this.state.beatTime * 255);
    p5.circle(this.state.baseNote.pos[0], this.state.baseNote.pos[1], 50);
    p5.circle(this.state.baseNote.pos[0] + 600, this.state.baseNote.pos[1], 50);
    this.state.notes.forEach((note) => {
      if (note !== false) {
        if (timeNow < note.endTime) {
          p5.fill(64, 204, 40);
        } else {
          p5.fill(128, 64, 40);
        }
        p5.image(note.asset, 50, 50);
        p5.circle(note.pos[0], note.pos[1], 50);
      }
    });
  }

  newBeat() {
    const now = performance.now();
    const getFood =
      this.assets[
        this.state.foods[Math.floor(Math.random() * this.state.foods.length)]
      ];
    return {
      ...this.state.baseNote,
      asset: getFood,
      startTime: now,
      endTime: this.whenToHit(now),
    };
  }

  processPhysics(proj, dt) {
    const ds = dt / 1000;
    const newProj = { ...proj };
    newProj.vel = proj.vel.map((v, i) => v + proj.acc[i] * ds);
    newProj.pos = proj.pos.map((p, i) => p + proj.vel[i] * ds);
    return newProj;
  }

  beatsPerMs() {
    return this.state.bpm / (60 * 1000);
  }

  getJustPressed() {
    if (this.input.pressed(" ")) {
      if (!this.state.pressed) {
        this.state.pressed = true;
        return true;
      }
    } else {
      this.state.pressed = false;
    }
    return false;
  }

  whenToHit(from) {
    const msPerBeat = 1 / this.beatsPerMs();
    return from + 8 * msPerBeat;
  }
  end() {
    return (
      this.score ===
      this.state.notes.reduce(
        (count, note) => (note === false ? count : count + 1),
        0
      )
    );
  }
}
