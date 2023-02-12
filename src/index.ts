import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
const { load } = require("./p5.play/p5.play");

// TODO:
// - Set Boundaries on Player
// - enemies from other directions

type LevelConfig = {
  playerSpeed: number;
  enemiesSpeed: number;
  spawnRateSec: number;
  enemySize: number;
  enemiesToPass: number;
};

type Levels = LevelConfig[];
const DEFAULT_LEVELS: Levels = [
  {
    playerSpeed: 1,
    enemiesSpeed: 4,
    spawnRateSec: 0.5,
    enemySize: 20,
    enemiesToPass: 25,
  },
  {
    playerSpeed: 0.5,
    enemiesSpeed: 5,
    spawnRateSec: 0.3,
    enemySize: 24,
    enemiesToPass: 25,
  },
  {
    playerSpeed: 0.1,
    enemiesSpeed: 6,
    spawnRateSec: 0.1,
    enemySize: 30,
    enemiesToPass: 25,
  },
  {
    playerSpeed: 0.05,
    enemiesSpeed: 7,
    spawnRateSec: 0.08,
    enemySize: 35,
    enemiesToPass: 25,
  },
  {
    playerSpeed: 0.03,
    enemiesSpeed: 8,
    spawnRateSec: 0.05,
    enemySize: 40,
    enemiesToPass: 25,
  },
];

const sketch = (p5: p5Play) => {
  class Game {
    private isGameOver = false;
    private gameStarted = false;
    private player: Sprite;
    private enemies: Group;
    private clouds: Group;
    private enemySpawnTimer: NodeJS.Timer;
    private cloudSpawnTimer: NodeJS.Timer;
    private currentLevel: number = 0;
    private levels: Levels;
    private enemiesPassedTotal: number = 0;
    private enemiesPassedThisLevel: number = 0;

    constructor(levels: Levels) {
      if (levels.length == 0) {
        throw Error("Not enought levels");
      }
      this.levels = levels;
    }

    private set modal(s: string) {
      p5.fill(255);
      p5.rect(p5.width / 2, p5.height / 2, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(s, p5.width / 2, p5.height / 2, 100, 50);
    }

    private displayLevel() {
      p5.fill(255);
      p5.rect(0, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(`Level: ${this.currentLevel + 1}`, 0, 0, 100, 50);
    }

    private dispalyEnemiesPassedTotal() {
      p5.fill(255);
      p5.rect(100, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(`Enemies Passed: ${this.enemiesPassedTotal}`, 100, 0, 100, 50);
    }

    private dispalyEnemiesPassedThisLevel() {
      p5.fill(255);
      p5.rect(200, 0, 200, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(
        `Passed This Level: ${this.enemiesPassedThisLevel}/${this.config.enemiesToPass}`,
        200,
        0,
        200,
        50
      );
    }

    draw() {
      if (this.isGameOver || !this.gameStarted) {
        this.modal = "Start";
        return;
      }
      p5.background("#87ceeb");
      this.clouds.draw();
      this.displayLevel();
      this.dispalyEnemiesPassedTotal();
      this.dispalyEnemiesPassedThisLevel();
      this.player.draw();
      this.enemies.draw();
      this.player.moveTowards(
        p5.mouseX,
        p5.mouseY - 50,
        this.config.playerSpeed
      );
      this.player.collides(this.enemies, () => {
        this.endGame();
      });
      this.enemies.cull(0, 0, 0, 0, (sprite) => {
        sprite.remove();
        this.incEnemiesPassed();
      });
    }

    private get config(): LevelConfig {
      return this.levels[this.currentLevel];
    }

    private incEnemiesPassed() {
      this.enemiesPassedTotal++;
      this.enemiesPassedThisLevel++;

      if (this.enemiesPassedThisLevel == this.config.enemiesToPass) {
        this.nextLevel();
      }
    }

    private nextLevel() {
      if (this.isGameOver) {
        return;
      }
      // Next Level
      if (this.levels.length == this.currentLevel + 1) {
        this.endGame();
        return;
      }
      this.currentLevel++;
      this.enemiesPassedThisLevel = 0;
    }

    requestToStart() {
      if (this.isGameOver) {
        this.enemies.removeAll();
        this.isGameOver = false;
        this.startEnemySpawning();
        this.startCloudSpawning();
        return;
      }

      if (!this.gameStarted) {
        this.start();
        return;
      }
    }
    // keyReleased() {
    //   this.player.speed = 0;
    //   this.player.direction = 0;
    // }

    private createPlayer() {
      let player = p5.createSprite(
        p5.width / 2,
        p5.height - 50,
        40,
        "kinematic"
      );
      player.img = "assets/plane.png";
      player.diameter = 40;
      return player;
    }

    private start() {
      this.enemies = p5.createGroup();
      this.player = this.createPlayer();
      this.clouds = p5.createGroup();
      this.player.overlaps(this.clouds);
      this.enemies.overlaps(this.clouds);
      this.gameStarted = true;
      this.startEnemySpawning();
      this.startCloudSpawning();
    }

    private endGame() {
      console.log("GAME OVER");
      this.isGameOver = true;
      this.currentLevel = 0;
      this.enemiesPassedTotal = 0;
      this.enemiesPassedThisLevel = 0;
      clearInterval(this.enemySpawnTimer);
      clearInterval(this.cloudSpawnTimer);
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
        g.img = "assets/plane.png";
        g.diameter = this.config.enemySize;
        g.rotation = 180;
        this.enemies.push(g);
      }, 1000 * this.config.spawnRateSec);
    }

    private startCloudSpawning() {
      this.cloudSpawnTimer = setInterval(() => {
        let g = p5.createSprite(
          p5.random(0, p5.width),
          -100,
          this.config.enemySize
        );
        g.direction = 90;
        g.speed = this.config.enemiesSpeed / 2;
        g.img = "assets/cloud.png";
        g.diameter = this.config.enemySize;
        g.rotation = 90;
        this.clouds.push(g);
      }, 1000 * this.config.spawnRateSec * 2);
    }
  }

  let game = new Game(DEFAULT_LEVELS);

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    game.draw();
  };

  p5.mouseClicked = () => {
    game.requestToStart();
  };

  p5.touchStarted = () => {
    game.requestToStart();
  };
};

load(p5);
new p5(sketch);
