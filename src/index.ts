import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
const { load } = require("./p5.play/p5.play");

// TODO:
// - Set Boundaries on Player
// - Levels
// - Display Levels
// - Clean up sprites off screen

type LevelConfig = {
  playerSpeed: number;
  enemiesSpeed: number;
  spawnRateSec: number;
  enemySize: number;
};

type Levels = LevelConfig[];

const DEFAULT_LEVELS: Levels = [
  {
    playerSpeed: 6,
    enemiesSpeed: 4,
    spawnRateSec: 0.5,
    enemySize: 20,
  },
  {
    playerSpeed: 5,
    enemiesSpeed: 5,
    spawnRateSec: 0.3,
    enemySize: 24,
  },
  {
    playerSpeed: 3,
    enemiesSpeed: 6,
    spawnRateSec: 0.1,
    enemySize: 30,
  },
  {
    playerSpeed: 2,
    enemiesSpeed: 7,
    spawnRateSec: 0.08,
    enemySize: 35,
  },
];

const sketch = (p5: p5Play) => {
  class Game {
    private isGameOver = false;
    private gameStarted = false;
    private player: Sprite;
    private enemies: Group;
    private enemySpawnTimer: NodeJS.Timer;
    private currentLevel: number = 0;
    private levels: Levels;

    constructor(levels: Levels) {
      if (levels.length == 0) {
        throw Error("Not enought levels");
      }
      this.levels = levels;
    }

    draw() {
      if (this.isGameOver || !this.gameStarted) {
        return;
      }
      p5.background(50);
      this.player.draw();
      this.enemies.draw();
      this.player.collides(this.enemies, () => {
        this.endGame();
      });
    }

    private get config(): LevelConfig {
      return this.levels[this.currentLevel];
    }

    keyPressed() {
      if (p5.keyCode == p5.LEFT_ARROW) {
        this.player.speed = this.config.playerSpeed;
        this.player.direction = 180;
        return;
      } else if (p5.keyCode == p5.RIGHT_ARROW) {
        this.player.speed = this.config.playerSpeed;
        this.player.direction = 0;
        return;
      }

      if (this.isGameOver && p5.key == " ") {
        this.enemies.removeAll();
        this.isGameOver = false;
        this.startEnemySpawning();
        return;
      }

      if (!this.gameStarted && p5.key == " ") {
        this.start();
        return;
      }

      if (p5.key == "n") {
        // Next Level
        if (this.levels.length == this.currentLevel + 1) {
          // TODO: Game Complete!
          return;
        }
        this.currentLevel++;
        // TODO: Update Level Text
      }

      return;
    }

    keyReleased() {
      this.player.speed = 0;
      this.player.direction = 0;
    }

    private start() {
      this.enemies = p5.createGroup();
      this.player = p5.createSprite(
        p5.width / 2,
        p5.height - 50,
        40,
        "kinematic"
      );
      this.player.shapeColor = p5.color(255);

      this.enemies = p5.createGroup();
      this.gameStarted = true;
      this.startEnemySpawning();
    }

    private endGame() {
      console.log("GAME OVER");
      this.isGameOver = true;
      this.currentLevel = 0;
      clearInterval(this.enemySpawnTimer);
    }

    private startEnemySpawning() {
      this.enemySpawnTimer = setInterval(() => {
        let g = p5.createSprite(
          p5.random(0, p5.width),
          0,
          this.config.enemySize
        );
        g.direction = 90;
        g.speed = this.config.enemiesSpeed;
        g.shapeColor = p5.color(255);
        this.enemies.push(g);
      }, 1000 * this.config.spawnRateSec);
    }
  }

  let game = new Game(DEFAULT_LEVELS);

  p5.setup = () => {
    p5.createCanvas(400, 400);
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
