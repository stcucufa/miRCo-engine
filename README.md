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

See `/games/situps` for a basic example game

`index.js` template

```js
export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input;
    this.assets = assets;
    this.libs = libs; // TODO: add physics/sound support
  }

  init(canvas) {
    return {
      /** Initialize any game state */
    };
  }

  update(state, dt) {
    /** logic to update game state */
  }

  draw(state, p5) {
    /** render visuals based on game state */
  }

  end(state) {
    // return true/false to indicate to engine whether game was won or lost
    return s.won;
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
