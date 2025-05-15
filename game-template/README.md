## Make a new game

hacky experience :O

1. copy the `your-game` dir in `/games`
2. move any games in `/games` to `/archived-games`
3. rename `your-game` to a unique name of your choice
4. update `manifest.json`. IMPORTANT: game `name` must match your dir name
5. add any game assets (images, sound) in the `/assets` dir, and register your assets in `manifest.json`
6. Add `?game=your-game` to the URL to run only your game while developing locally

add your game logic

server will automatically restart on save, but you'll have to refresh the browser each time, sorry, I suck ¯\_(ツ)\_/¯
