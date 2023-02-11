import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
const { load } = require("./p5.play/p5.play");

const PLAYER_SPEED = 5;
const GHOST_SPEED = 5;
const SPAWN_RATE_SEC = 0.3;
const GHOST_SIZE = 25;

type LevelConfig = {
  playerSpeed: number;
  enemiesSpeed: number;
  spawnRateSec: number;
  enemySize: number;
};

type Levels = LevelConfig[];

const sketch = (p5: p5Play) => {
  class Game {
    private isGameOver = false;
    private player: Sprite;
    private enemies: Group;
    private enemySpawnTimer: NodeJS.Timer;

    update(config: LevelConfig) {}

    setup() {
      this.enemies = p5.createGroup();
      p5.createCanvas(400, 400);
      this.player = p5.createSprite(
        p5.width / 2,
        p5.height - 50,
        40,
        "kinematic"
      );
      this.player.shapeColor = p5.color(255);

      this.enemies = p5.createGroup();
      this.startEnemySpawning();
    }

    draw() {
      if (this.isGameOver) {
        return;
      }
      // enemies.moveTowards(width / 2, height);
      p5.background(50);
      this.player.draw();
      this.enemies.draw();
      this.player.collides(this.enemies, () => {
        this.endGame();
      });
    }

    keyPressed() {
      if (p5.keyCode == p5.LEFT_ARROW) {
        this.player.speed = PLAYER_SPEED;
        this.player.direction = 180;
        return;
      } else if (p5.keyCode == p5.RIGHT_ARROW) {
        this.player.speed = PLAYER_SPEED;
        this.player.direction = 0;
        return;
      }

      if (this.isGameOver && p5.key == " ") {
        this.enemies.removeAll();
        this.isGameOver = false;
        this.startEnemySpawning();
        return;
      }

      return;
    }

    keyReleased() {
      this.player.speed = 0;
      this.player.direction = 0;
    }

    private endGame() {
      console.log("GAME OVER");
      this.isGameOver = true;
      clearInterval(this.enemySpawnTimer);
    }

    private startEnemySpawning() {
      this.enemySpawnTimer = setInterval(() => {
        let g = p5.createSprite(p5.random(0, p5.width), 0, GHOST_SIZE);
        g.direction = 90;
        g.speed = GHOST_SPEED;
        g.shapeColor = p5.color(255);
        this.enemies.push(g);
      }, 1000 * SPAWN_RATE_SEC);
    }
  }

  let game = new Game();

  p5.setup = () => {
    game.setup();
  };

  p5.draw = () => {
    game.draw();
  };

  p5.keyPressed = () => {
    game.keyPressed();
  };

  p5.keyReleased = () => {
    game.keyReleased();
  };
};

load(p5);
new p5(sketch);
