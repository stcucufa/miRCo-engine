import { GameManager } from "./gameManager.js";

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas");

  const manager = new GameManager(canvas);
  manager.init();
});
