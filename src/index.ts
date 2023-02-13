import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
import { orientationConfig } from "./orientation";
import { DEFAULT_LEVELS, LevelConfig, LevelManager, Levels } from "./levels";
const { load } = require("./p5.play/p5.play");

// TODO:
// - sounds related to levels (birds from east, winds hard to control)
// - explosion animation
// - better displays for levels
// - when getting to harder levels, animations change
// - airplane animation banking
// - more bird animations

const sketch = (p5: p5Play) => {
  const ANIMATIONS = {
    birds: {
      blue: {
        flapping: {
          first: "assets/birds/blue/flapping/000.png",
          total: 9,
        },
      },
      brown: {
        flapping: {
          first: "assets/birds/brown/flapping/__brown_bird_flapping_000.png",
          total: 9,
        },
      },
      canary: {
        flapping: {
          first: "assets/birds/canary/flapping/__canary_flapping_000.png",
          total: 9,
        },
      },
      green: {
        flapping: {
          first: "assets/birds/green/flapping/__green_flapping_000.png",
          total: 9,
        },
      },
    },
  };
  class Birds {
    private birdSpawnTimer: NodeJS.Timer;
    private birdsPassedTotal: number = 0;
    private birdsPassedThisLevel: number = 0;
    private levelManager: LevelManager;
    private spriteGroup: Group;
    passedLevelCb: () => void;

    constructor(l: LevelManager) {
      this.spriteGroup = p5.createGroup();

      for (const key of Object.keys(ANIMATIONS.birds)) {
        let animation = p5.loadAnimation(
          ANIMATIONS.birds[key].flapping.first,
          ANIMATIONS.birds[key].flapping.total
        );
        animation.frameDelay = 10;
        this.group.addAni(key, animation);
      }

      this.levelManager = l;
      this.startBirdSpawning();
    }

    draw() {
      this.group.draw();
      this.group.cull(0, 0, 0, 0, (sprite) => {
        sprite.remove();
        this.incrementBirdsPassed();
      });
    }

    reset() {
      clearInterval(this.birdSpawnTimer);
      this.group.removeAll();
      this.birdsPassedTotal = 0;
      this.birdsPassedThisLevel = 0;
      this.startBirdSpawning();
    }

    private startBirdSpawning() {
      this.birdSpawnTimer = setInterval(() => {
        let orientation =
          orientationConfig(p5)[
            p5.random(this.levelManager.config.birdSpawnDirections)
          ];

        let g = new this.group.GroupSprite(
          orientation.x(),
          orientation.y(),
          25
        );
        g.direction = orientation.direction;
        g.speed = this.levelManager.config.planesSpeed;
        g.rotation = orientation.rotation;
        g.ani = p5.random(Object.keys(ANIMATIONS.birds));
      }, 1000 * this.levelManager.config.spawnRateSec);
    }

    private incrementBirdsPassed() {
      this.birdsPassedTotal++;
      this.birdsPassedThisLevel++;

      if (this.birdsPassedThisLevel == this.levelManager.config.birdsToPass) {
        this.birdsPassedThisLevel = 0;
        this.passedLevelCb();
      }
    }

    get passedTotal(): number {
      return this.birdsPassedTotal;
    }

    get passedThisLevel(): number {
      return this.birdsPassedThisLevel;
    }

    get group(): Group {
      return this.spriteGroup;
    }
  }
  class Game {
    private isGameOver = false;
    private gameStarted = false;
    private player: Sprite;
    private clouds: Group;
    private cloudSpawnTimer: NodeJS.Timer;
    private redPlaneAnimation: any;
    private birds: Birds;
    private levelManager: LevelManager;

    constructor(levelManager: LevelManager) {
      let redPlaneAnimation = p5.loadAnimation(
        "assets/plane/red/nobank/1.png",
        6
      );

      this.redPlaneAnimation = redPlaneAnimation;
      this.levelManager = levelManager;
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
      p5.text(`Level: ${this.levelManager.level + 1}`, 0, 0, 100, 50);
    }

    private displayBirdsPassedTotal() {
      p5.fill(255);
      p5.rect(100, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(`Birds Passed: ${this.birds.passedTotal}`, 100, 0, 100, 50);
    }

    private displayBirdsPassedThisLevel() {
      p5.fill(255);
      p5.rect(200, 0, 100, 50);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(0);
      p5.text(
        `Passed This Level: ${this.birds.passedThisLevel}/${this.levelManager.config.birdsToPass}`,
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
      this.displayBirdsPassedTotal();
      this.displayBirdsPassedThisLevel();
      this.player.draw();
      this.birds.draw();
      this.player.moveTowards(
        p5.mouseX,
        p5.mouseY - 75,
        this.levelManager.config.playerSpeed
      );
      this.player.collides(this.birds.group, () => {
        this.endGame();
      });

      this.player.ani.scale = 0.1 * p5.sin(p5.millis() / 10) + 1; // hover effect
    }

    requestToStart() {
      if (this.isGameOver) {
        this.birds.reset();
        this.isGameOver = false;
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
      this.birds = new Birds(this.levelManager);
      this.birds.passedLevelCb = () => {
        if (!this.levelManager.levelUp()) {
          this.endGame();
        }
      };
      this.player = this.createPlayer();
      this.clouds = p5.createGroup();
      this.player.overlaps(this.clouds);
      this.birds.group.overlaps(this.clouds);
      this.gameStarted = true;
      this.birds.group.debug = p5.kb.pressing("d");
      this.player.debug = p5.kb.pressing("d");
      this.startCloudSpawning();
    }

    private endGame() {
      console.log("GAME OVER");
      this.isGameOver = true;
      this.levelManager.reset();
      clearInterval(this.cloudSpawnTimer);
    }

    private startCloudSpawning() {
      this.cloudSpawnTimer = setInterval(() => {
        let g = p5.createSprite(p5.random(0, p5.width), -100, 100);
        g.direction = 90;
        g.speed = this.levelManager.config.planesSpeed / 2;
        g.img = "assets/cloud.png";
        g.rotation = 90;
        this.clouds.push(g);
      }, 1000 * this.levelManager.config.spawnRateSec * 2);
    }
  }
  let lm = new LevelManager(DEFAULT_LEVELS);

  let game = new Game(lm);

  p5.setup = () => {
    new p5.Canvas("9:19.5");
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
