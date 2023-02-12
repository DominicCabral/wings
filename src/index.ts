import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
import { orientationConfig } from "./orientation";
import { DEFAULT_LEVELS, LevelConfig, Levels } from "./levels";
const { load } = require("./p5.play/p5.play");

// TODO:
// - airplane hover sin wave
// - sounds related to levels (birds from east, winds hard to control)
// - explosion animation
// - better displays for levels
// - when getting to harder levels, animations change
// - airplane animation banking

let ANIMATIONS = {
  birds: {
    blue: {
      flapping: {
        first: "assets/birds/blue/flapping/000.png",
        total: 9,
      },
    },
  },
};

const sketch = (p5: p5Play) => {
  class Game {
    private isGameOver = false;
    private gameStarted = false;
    private player: Sprite;
    private birds: Group;
    private clouds: Group;
    private birdSpawnTimer: NodeJS.Timer;
    private cloudSpawnTimer: NodeJS.Timer;
    private currentLevel: number = 0;
    private levels: Levels;
    private planesPassedTotal: number = 0;
    private planesPassedThisLevel: number = 0;
    private blueBirdAnimation: any;
    private redPlaneAnimation: any;

    constructor(levels: Levels) {
      if (levels.length == 0) {
        throw Error("Not enought levels");
      }
      this.levels = levels;

      let blueBirdAnimation = p5.loadAnimation(
        ANIMATIONS.birds.blue.flapping.first,
        ANIMATIONS.birds.blue.flapping.total
      );

      let redPlaneAnimation = p5.loadAnimation(
        "assets/plane/red/nobank/1.png",
        6
      );

      blueBirdAnimation.frameDelay = 10;

      this.blueBirdAnimation = blueBirdAnimation;
      this.redPlaneAnimation = redPlaneAnimation;
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

    private displayPlanesPassedTotal() {
      p5.fill(255);
      p5.rect(100, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(`Planes Passed: ${this.planesPassedTotal}`, 100, 0, 100, 50);
    }

    private displayPlanesPassedThisLevel() {
      p5.fill(255);
      p5.rect(200, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(
        `Passed This Level: ${this.planesPassedThisLevel}/${this.config.planesToPass}`,
        200,
        0,
        100,
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
      this.displayPlanesPassedTotal();
      this.displayPlanesPassedThisLevel();
      this.player.draw();
      this.birds.draw();
      this.player.moveTowards(
        p5.mouseX,
        p5.mouseY - 75,
        this.config.playerSpeed
      );
      this.player.collides(this.birds, () => {
        this.endGame();
      });
      this.birds.cull(0, 0, 0, 0, (sprite) => {
        sprite.remove();
        this.incPlanesPassed();
      });
    }

    private get config(): LevelConfig {
      return this.levels[this.currentLevel];
    }

    private incPlanesPassed() {
      this.planesPassedTotal++;
      this.planesPassedThisLevel++;

      if (this.planesPassedThisLevel == this.config.planesToPass) {
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
      this.planesPassedThisLevel = 0;
    }

    requestToStart() {
      if (this.isGameOver) {
        this.birds.removeAll();
        this.isGameOver = false;
        this.startPlaneSpawning();
        this.startCloudSpawning();
        return;
      }

      if (!this.gameStarted) {
        this.start();
        return;
      }
    }

    private createPlayer() {
      let player = p5.createSprite(
        p5.width / 2,
        p5.height - 50,
        40,
        "kinematic"
      );
      player.diameter = 40;
      player.addAni("nobank", this.redPlaneAnimation);
      return player;
    }

    private start() {
      this.birds = p5.createGroup();
      this.birds.addAni("fly", this.blueBirdAnimation);
      this.player = this.createPlayer();
      this.clouds = p5.createGroup();
      this.player.overlaps(this.clouds);
      this.birds.overlaps(this.clouds);
      this.gameStarted = true;
      this.birds.debug = p5.kb.presses("d");
      this.player.debug = p5.kb.presses("d");
      this.startPlaneSpawning();
      this.startCloudSpawning();
    }

    private endGame() {
      console.log("GAME OVER");
      this.isGameOver = true;
      this.currentLevel = 0;
      this.planesPassedTotal = 0;
      this.planesPassedThisLevel = 0;
      clearInterval(this.birdSpawnTimer);
      clearInterval(this.cloudSpawnTimer);
    }

    private startPlaneSpawning() {
      this.birdSpawnTimer = setInterval(() => {
        let orientation =
          orientationConfig(p5)[p5.random(this.config.birdSpawnDirections)];

        let g = new this.birds.GroupSprite(
          orientation.x(),
          orientation.y(),
          25
        );
        g.direction = orientation.direction;
        g.speed = this.config.planesSpeed;
        g.rotation = orientation.rotation;
      }, 1000 * this.config.spawnRateSec);
    }

    private startCloudSpawning() {
      this.cloudSpawnTimer = setInterval(() => {
        let g = p5.createSprite(p5.random(0, p5.width), -100, 100);
        g.direction = 90;
        g.speed = this.config.planesSpeed / 2;
        g.img = "assets/cloud.png";
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
