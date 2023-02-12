import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
const { load } = require("./p5.play/p5.play");

// TODO:
// - airplane hover sin wave
// - sounds
// - explosion animation

type LevelConfig = {
  playerSpeed: number;
  planesSpeed: number;
  spawnRateSec: number;
  birdSpawnDirections: Orientation[];
  enemySize: number;
  planesToPass: number;
};

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

type OrientationConfig = {
  direction: number;
  x: () => number;
  y: () => number;
  rotation: number;
};

type Orientation = "north" | "west" | "east" | "south";

type Levels = LevelConfig[];
const DEFAULT_LEVELS: Levels = [
  {
    playerSpeed: 0.1,
    planesSpeed: 4,
    spawnRateSec: 0.5,
    enemySize: 20,
    planesToPass: 25,
    birdSpawnDirections: ["north"],
  },
  {
    playerSpeed: 0.08,
    planesSpeed: 5,
    spawnRateSec: 0.1,
    enemySize: 24,
    planesToPass: 25,
    birdSpawnDirections: ["north"],
  },
  {
    playerSpeed: 0.06,
    planesSpeed: 6,
    spawnRateSec: 0.07,
    enemySize: 30,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.04,
    planesSpeed: 7,
    spawnRateSec: 0.03,
    enemySize: 35,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.03,
    planesSpeed: 8,
    spawnRateSec: 0.005,
    enemySize: 40,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east", "west"],
  },
  {
    playerSpeed: 0.01,
    planesSpeed: 10,
    spawnRateSec: 0.001,
    enemySize: 40,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east", "west", "south"],
  },
];

const sketch = (p5: p5Play) => {
  const ORIENTATION_CONFIG: Record<Orientation, OrientationConfig> = {
    west: {
      direction: 0,
      x: () => {
        return 0;
      },
      y: () => {
        return p5.random(0, p5.height);
      },
      rotation: 90,
    },
    north: {
      direction: 90,
      x: () => {
        return p5.random(0, p5.width);
      },
      y: () => {
        return 0;
      },
      rotation: 180,
    },
    east: {
      direction: 180,
      x: () => {
        return p5.width;
      },
      y: () => {
        return p5.random(0, p5.height);
      },
      rotation: 270,
    },
    south: {
      direction: 270,
      x: () => {
        return p5.random(0, p5.width);
      },
      y: () => {
        return p5.height;
      },
      rotation: 0,
    },
  };
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

    constructor(levels: Levels) {
      if (levels.length == 0) {
        throw Error("Not enought levels");
      }
      this.levels = levels;

      let blueBirdAnimation = p5.loadAnimation(
        "assets/birds/blue/flapping/000.png",
        9
      );

      blueBirdAnimation.frameDelay = 10;

      this.blueBirdAnimation = blueBirdAnimation;
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

    private dispalyPlanesPassedTotal() {
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
      this.dispalyPlanesPassedTotal();
      this.displayPlanesPassedThisLevel();
      this.player.draw();
      this.birds.draw();
      this.player.moveTowards(
        p5.mouseX,
        p5.mouseY - 50,
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
      player.img = "assets/plane.png";
      player.diameter = 40;
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
          ORIENTATION_CONFIG[p5.random(this.config.birdSpawnDirections)];

        let g = new this.birds.GroupSprite(
          orientation.x(),
          orientation.y(),
          this.config.enemySize
        );
        g.direction = orientation.direction;
        g.speed = this.config.planesSpeed;
        g.diameter = this.config.enemySize;
        g.rotation = orientation.rotation;
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
        g.speed = this.config.planesSpeed / 2;
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
