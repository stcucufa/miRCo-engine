## miCRo - micro game engine for RC

a la Warioware

## Running locally

Pre-reqs: have `node` and `npm` installed

```sh
# clone this repo, then:

# install deps
npm i

# run dev server
npm run dev
```

Games are served out of `/games` dir. A game should be a dir titled `your-game-name` with the following structure

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
    this.libs = libs; // TODO: add physics/sound support
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

`manifest.json`: declare game metadata and register assets

IMPORTANT: name of game must match folder name

```json
{
  "name": "situps",
  "assets": ["situp.png"]
}
```

## Roadmap

- Clean up smelly microgame API
- add dev mode for game makers to iterate on their own game
- add physics + sound support
- add transitions and win/lose tracking between games
- logic to speed up?
