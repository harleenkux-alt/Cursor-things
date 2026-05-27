(function () {
  "use strict";

  const TILE_EMPTY = 0;
  const TILE_WALL = 1;
  const TILE_START = 2;
  const TILE_EXIT = 3;

  const LEVEL = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  class MazeGame {
    constructor(canvas, statusElement) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.statusElement = statusElement;
      this.maze = LEVEL;
      this.rows = this.maze.length;
      this.columns = this.maze[0].length;
      this.tileSize = this.canvas.width / this.columns;
      this.player = this.findTile(TILE_START);
      this.exit = this.findTile(TILE_EXIT);
      this.hasWon = false;
    }

    start() {
      this.reset();
    }

    reset() {
      this.player = this.findTile(TILE_START);
      this.hasWon = false;
      this.setStatus("Reach the exit to win.", false);
      this.draw();
    }

    movePlayer(dx, dy) {
      if (this.hasWon) {
        return;
      }

      const nextPosition = {
        row: this.player.row + dy,
        column: this.player.column + dx,
      };

      if (this.isWall(nextPosition.row, nextPosition.column)) {
        this.setStatus("Blocked by an energy wall.", false);
        return;
      }

      this.player = nextPosition;

      if (this.player.row === this.exit.row && this.player.column === this.exit.column) {
        this.hasWon = true;
        this.setStatus("You escaped the neon maze!", true);
      } else {
        this.setStatus("Keep moving toward the green exit.", false);
      }

      this.draw();
    }

    draw() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawBackground();
      this.drawMaze();
      this.drawPlayer();
    }

    drawBackground() {
      const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      gradient.addColorStop(0, "#08152c");
      gradient.addColorStop(1, "#02050c");

      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMaze() {
      for (let row = 0; row < this.rows; row += 1) {
        for (let column = 0; column < this.columns; column += 1) {
          const tile = this.maze[row][column];
          const x = column * this.tileSize;
          const y = row * this.tileSize;

          if (tile === TILE_WALL) {
            this.drawWall(x, y);
          } else {
            this.drawFloor(x, y);
          }

          if (tile === TILE_EXIT) {
            this.drawExit(x, y);
          }
        }
      }
    }

    drawWall(x, y) {
      const inset = 2;
      const size = this.tileSize - inset * 2;

      this.context.fillStyle = "#1b2745";
      this.context.fillRect(x + inset, y + inset, size, size);

      this.context.strokeStyle = "rgba(57, 245, 255, 0.26)";
      this.context.lineWidth = 2;
      this.context.strokeRect(x + inset, y + inset, size, size);
    }

    drawFloor(x, y) {
      this.context.fillStyle = "rgba(57, 245, 255, 0.035)";
      this.context.fillRect(x, y, this.tileSize, this.tileSize);

      this.context.strokeStyle = "rgba(255, 255, 255, 0.035)";
      this.context.lineWidth = 1;
      this.context.strokeRect(x, y, this.tileSize, this.tileSize);
    }

    drawExit(x, y) {
      const center = this.getTileCenter(x, y);
      const radius = this.tileSize * 0.3;

      this.context.fillStyle = "rgba(98, 255, 142, 0.18)";
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius * 1.35, 0, Math.PI * 2);
      this.context.fill();

      this.context.fillStyle = "#62ff8e";
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
      this.context.fill();
    }

    drawPlayer() {
      const x = this.player.column * this.tileSize;
      const y = this.player.row * this.tileSize;
      const center = this.getTileCenter(x, y);
      const radius = this.tileSize * 0.28;

      this.context.shadowColor = "#39f5ff";
      this.context.shadowBlur = 18;
      this.context.fillStyle = "#39f5ff";
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
      this.context.fill();
      this.context.shadowBlur = 0;

      this.context.fillStyle = "#effcff";
      this.context.beginPath();
      this.context.arc(center.x - radius * 0.28, center.y - radius * 0.28, radius * 0.28, 0, Math.PI * 2);
      this.context.fill();
    }

    getTileCenter(x, y) {
      return {
        x: x + this.tileSize / 2,
        y: y + this.tileSize / 2,
      };
    }

    isWall(row, column) {
      const isOutsideMaze = row < 0 || row >= this.rows || column < 0 || column >= this.columns;

      if (isOutsideMaze) {
        return true;
      }

      return this.maze[row][column] === TILE_WALL;
    }

    findTile(tileType) {
      for (let row = 0; row < this.rows; row += 1) {
        for (let column = 0; column < this.columns; column += 1) {
          if (this.maze[row][column] === tileType) {
            return { row, column };
          }
        }
      }

      throw new Error("Required maze tile was not found.");
    }

    setStatus(message, isWon) {
      this.statusElement.textContent = message;
      this.statusElement.classList.toggle("is-won", isWon);
    }
  }

  window.MazeGame = MazeGame;
})();
