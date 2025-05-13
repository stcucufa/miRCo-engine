## miCRo - micro game engine for RC

a la Warioware

## Running locally

Pre-reqs: have `node` and `npm` installed

Clone this repo, then:

```sh

# install deps
npm i

# run dev server
npm run dev
```

## Game dev

Games are served out of `/games` dir. A game should be a dir titled `your-game-name` with the following structure

To just iterate on your own game on a loop, move all the other `/games` to `archived-games`. Your game in `/games` dir should have

```
 your-game
    assets/
      your-image.png
    index.js
    manifest.json
```

Assets are optional, if your game uses them. The only mandatory parts are an index.js file, and a manifest.json

See `/games/situps` [here](https://github.com/clairefro/miRCo-engine/tree/main/games/situps) for a basic example game

`index.js` template

```js
export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input;
    this.assets = assets;
    this.libs = libs;
    // default game state
    this.state = {
      gameOver: false,
      won: false, // defaulting to false = lose by default, true = win by default
    };
  }

  init(canvas) {
    /** Initialize any custom game state */
    const customState = {
      /* 
        athlete: {
           x: canvas.width / 2
           y: 100
           isDown: true
        }
        situps: 0
        ...
        */
    };
    this.state = { ...this.state, ...customState };
  }

  update(dt) {
    /** logic to update game state, called on each tick */

    this.draw(); // call at the end of update
  }

  draw() {
    /** render visuals based on game state */
  }

  end() {
    // return true/false to indicate to engine whether game was won or lost
    return this.state.won;
  }
}
```

`manifest.json`: declare game metadata and register assets and instructions

IMPORTANT: **name of game must match yoru game dir name**

```json
{
  "name": "situps",
  "assets": ["situp.png, fart.mp3"],
  "instruction": "Situp !",
  "author": "Your Name"
}
```

### Drawing

The [`p5` library](https://p5js.org/) is available to you on `this.lib.p5`

You can use this to render things to the screen in the `draw()` method

example from [situps](https://github.com/clairefro/miRCo-engine/tree/main/games/situps) game
```js
draw() {
    const state = this.state;
    const p5 = this.libs.p5;

    p5.background(255);
    p5.push();
    p5.translate(
      state.athlete.x + state.athlete.width / 2,
      state.athlete.y + state.athlete.height / 2
    );
    p5.rotate(state.athlete.isDown ? 0 : -p5.PI / 4);
    p5.imageMode(p5.CENTER);
    p5.image(
      this.assets["situp.png"],
      0,
      0,
      state.athlete.width,
      state.athlete.height
    );
    p5.pop();

    // Draw counter
    p5.textSize(24);
    p5.textAlign(p5.LEFT);
    p5.fill(0);
    p5.text(
      `Sit-ups: ${state.athlete.sitUpCount}/${state.requiredSitUps}`,
      10,
      30
    );

    if (state.gameOver) {
      p5.textSize(48);
      p5.textAlign(p5.CENTER);
      p5.fill(0, 255, 0); // green
      p5.text(state.message, p5.width / 2, p5.height / 2);
    }
  }
```

### Images

Supported formats: `.png`, `.jpg`

Save your image assets in `/assets` dir inside your game, and declare the filenames in your `manifest.json` assets property

```
situps
    assets/
      situp.png
      fart.mp3
    index.js
    manifest.json
```

manifest.json
````json
{
  "name": "situps",
  "assets": ["situp.png", "fart.mp3"],
  "instruction": "Situp ↑ !",
  "author": "Claire Froelich"
}
```

index.js
```js
p5.image(
  this.assets["situp.png"],
  0,
  0,
  state.athlete.width,
  state.athlete.height
);
````

### Sound

Supported formats: `.mp3`, `.wav`

Save your sounds in an `/assets` dir in your game, in declare the filename(s) in your `manifest.json` assets property.

miRCo uses [Howler js](https://howlerjs.com/) to play sound. You can access sound controls from `this.libs.sounds`

```
situps
    assets/
      situp.png
      fart.mp3
    index.js
    manifest.json
```

manifest.json

```json
{
  "name": "situps",
  "assets": ["situp.png", "fart.mp3"],
  "instruction": "Situp ↑ !",
  "author": "Claire Froelich"
}
```

index.js

```js
// index.js
// start sound
this.libs.sound.play(this.assets["fart.mp3"]);

// stop sound
this.libs.sound.stop(this.assets["fart.mp3"]);
```

### Game examples

- [Situps](https://github.com/clairefro/miRCo-engine/tree/main/games/situps) (image, sound)
- [Dodge Block](https://github.com/clairefro/miRCo-engine/tree/main/games/dodge-block) (image)

## Roadmap

- add dev mode for game makers to iterate on their own game
- add physics + sound support
- add transitions and win/lose tracking between games
- logic to speed up?
