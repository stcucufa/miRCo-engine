import express from "express";
import path from "path";
import fs from "fs/promises";

const app = express();
const PORT = 3000;

const MICROGAMES_DIR = path.resolve("./games");

app.use("/games", express.static(MICROGAMES_DIR));
app.use("/", express.static("./client"));

app.get("/api/games", async (req, res) => {
  try {
    const dirs = await fs.readdir(MICROGAMES_DIR, { withFileTypes: true });
    console.log({ dirs });
    const games = await Promise.all(
      dirs
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const manifestPath = path.join(
            MICROGAMES_DIR,
            dirent.name,
            "manifest.json"
          );
          console.log({ manifestPath });
          try {
            const manifest = JSON.parse(
              await fs.readFile(manifestPath, "utf-8")
            );
            return { name: dirent.name, ...manifest };
          } catch {
            return null;
          }
        })
    );

    res.json(games.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: "Failed to list games" });
  }
});

app.listen(PORT, () => {
  console.log(`GameManager running at http://localhost:${PORT}`);
});

export { app };
