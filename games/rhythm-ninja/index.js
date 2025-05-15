export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input
    this.assets = assets
    this.libs = libs
    this.state = {
      gameOver: false,
      won: true,
    }
  }

  init(canvas) {
    const p5 = this.libs.p5
    p5.noStroke()
    p5.textSize(24)
    p5.textStyle(p5.BOLD)
    this.state = {
      foods: [
        'banana_1f34c.png',
        'cooked-rice_1f35a.png',
        'curry-and-rice_1f35b.png',
        'fried-shrimp_1f364.png',
        'grapes_1f347.png',
        'green-apple_1f34f.png',
        'lemon_1f34b.png',
        'melon_1f348.png',
        'pear_1f350.png',
        'pineapple_1f34d.png',
        'red-apple_1f34e.png',
        'rice-ball_1f359.png',
        'rice-cracker_1f358.png',
        'steaming-bowl_1f35c.png',
        'sushi_1f363.png',
        'tangerine_1f34a.png',
        'watermelon_1f349.png',
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
        spin: 0,
        caught: false,
      },
      startTime: performance.now(),
      beatTime: 0,
    }
  }

  update(dt) {
    const justPressed = this.getJustPressed()
    const timeNow = performance.now()
    const timeSince = timeNow - this.state.startTime
    const beatsSince = timeSince * this.beatsPerMs()
    this.state.beatTime = (beatsSince / 2) % 1
    if (this.state.notes.length < 8 && beatsSince > this.state.notes.length) {
      const note = Math.random() > 0.5 ? false : this.newBeat()
      if (note) {
        this.libs.sound.play(this.assets['tick.mp3'])
      }
      this.state.notes.push(note)
    }

    if (justPressed) {
      const timingWindow = 0.5 / this.beatsPerMs()
      if (this.lastPressTime + timingWindow < timeNow) {
        this.lastPressTime = timeNow
        this.state.notes.forEach((note, i) => {
          if (
            timeNow < note.endTime + timingWindow &&
            timeNow > note.endTime - timingWindow &&
            !note.caught
          ) {
            this.state.notes[i].caught = true
            this.state.score += 1
            this.libs.sound.play(this.assets['cyrene-nom.mp3'])
          }
        })
        this.score += 1
      }
      this.lastPressTime = timeNow
    }

    this.state.notes = this.state.notes.map((note) => {
      if (note === false) return false
      if (timeNow > note.endTime) {
        note.vel = [note.vel[0], -400]
        note.spin = note.spin * -2
        return this.processPhysics(note, dt)
      } else {
        return this.processPhysics(note, dt)
      }
    })

    this.draw()
  }

  draw() {
    const timeNow = performance.now()
    const p5 = this.libs.p5
    p5.background(255)
    p5.image(
      this.assets['octopus_invert_1f419.png'],
      this.state.baseNote.pos[0] - 30,
      this.state.beatTime * 10 + this.state.baseNote.pos[1],
      60,
      60
    )
    p5.image(
      this.assets['octopus_1f419.png'],
      this.state.baseNote.pos[0] - 30 + 600,
      this.state.beatTime * 20 + this.state.baseNote.pos[1],
      60,
      60
    )
    p5.fill(0)
    p5.text(
      'caught: ' +
        this.state.score +
        ' / ' +
        this.noteCount() +
        '\n' +
        '(press up!)',
      15,
      45
    )

    this.state.notes.forEach((note) => {
      if (note !== false && !note.caught) {
        this.imageWithRotation(
          p5,
          note.asset,
          50,
          note.pos[0],
          note.pos[1],
          note.rot
        )
      }
    })
  }

  newBeat() {
    const now = performance.now()
    const getFood =
      this.assets[
        this.state.foods[Math.floor(Math.random() * this.state.foods.length)]
      ]
    return {
      ...this.state.baseNote,
      asset: getFood,
      spin: Math.random() - 0.5 + Math.random() - 0.5,
      startTime: now,
      endTime: this.whenToHit(now),
    }
  }

  processPhysics(proj, dt) {
    const ds = dt / 1000
    const newProj = { ...proj }
    newProj.vel = proj.vel.map((v, i) => v + proj.acc[i] * ds)
    newProj.pos = proj.pos.map((p, i) => p + proj.vel[i] * ds)
    newProj.rot = proj.rot + proj.spin
    return newProj
  }

  beatsPerMs() {
    return this.state.bpm / (60 * 1000)
  }

  getJustPressed() {
    if (this.input.isPressedUp()) {
      if (!this.state.pressed) {
        this.state.pressed = true
        return true
      }
    } else {
      this.state.pressed = false
    }
    return false
  }

  imageWithRotation(p5, asset, size, posX, posY, rot) {
    p5.push()
    p5.translate(posX, posY)
    p5.rotate(rot)
    p5.image(asset, 0 - size / 2, 0 - size / 2, size, size)
    p5.pop()
  }

  whenToHit(from) {
    const msPerBeat = 1 / this.beatsPerMs()
    return from + 8 * msPerBeat
  }
  end() {
    return this.state.score === this.noteCount()
  }
  noteCount() {
    return this.state.notes.reduce(
      (count, note) => (note === false ? count : count + 1),
      0
    )
  }
}
