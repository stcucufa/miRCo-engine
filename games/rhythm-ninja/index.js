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
    this.state = {
      bpm: 280,
      notes: [],
      baseNote: { pos: [0, 300], vel: [300, -300], acc: [0, 300] },
      startTime: performance.now(),
    };
    const beat = this.processPhysics(
      this.newBeat(),
      this.whenToHit(performance.now())
    );
    beat.isGuide = true;
    beat.acc = [0, 0];
    beat.vel = [0, 0];
    this.state.notes.push(beat);
  }

  update(dt) {
    const timeNow = performance.now();
    const timeSince = timeNow - this.state.startTime;
    const beatsSince = timeSince * this.beatsPerMs();
    if (this.state.notes.length < 8 && beatsSince > this.state.notes.length) {
      const note = Math.random() > 0.5 ? false : this.newBeat();
      this.state.notes.push(note);
    }

    this.state.notes = this.state.notes.map((note) =>
      note === false ? false : this.processPhysics(note, dt)
    );

    this.draw();
  }

  draw() {
    const timeNow = performance.now();
    const p5 = this.libs.p5;
    p5.background(255);

    this.state.notes.forEach((note) => {
      if (note !== false) {
        console.log(timeNow, note.endTime);
        if (note.isGuide) {
          p5.fill(128);
        } else {
          if (timeNow < note.endTime) {
            p5.fill(64, 204, 40);
          } else {
            p5.fill(128, 64, 40);
          }
        }
        p5.circle(note.pos[0], note.pos[1], 50);
      }
    });
  }

  newBeat() {
    const now = performance.now();
    return {
      ...this.state.baseNote,
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

  end() {
    return this.state.won;
  }

  whenToHit(from) {
    const secondsPerBeat = 1 / this.beatsPerMs();
    return from + 8 * secondsPerBeat;
  }
}
