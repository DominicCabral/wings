import { Orientation } from "./orientation";

export type LevelConfig = {
  playerSpeed: number;
  planesSpeed: number;
  spawnRateSec: number;
  birdSpawnDirections: Orientation[];
  birdsToPass: number;
};

export type Levels = LevelConfig[];
export class LevelManager {
  private levels: Levels;
  private currentLevel: number = 0;
  private levelUpListeners: (() => void)[] = [];

  constructor(l: Levels) {
    if (l.length == 0) {
      throw Error("Not enought levels");
    }
    this.levels = l;
  }

  addLevelUpListener(cb: () => void) {
    this.levelUpListeners.push(cb);
  }

  levelUp() {
    if (this.levels.length == this.currentLevel + 1) {
      return false;
    }

    this.currentLevel++;
    this.levelUpListeners.forEach((cb) => {
      cb();
    });
    return true;
  }

  reset() {
    this.currentLevel = 0;
  }

  get level() {
    return this.currentLevel;
  }

  get config(): LevelConfig {
    return this.levels[this.currentLevel];
  }
}
export const DEFAULT_LEVELS: Levels = [
  {
    playerSpeed: 0.1,
    planesSpeed: 4,
    spawnRateSec: 0.5,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east", "west"],
  },
  {
    playerSpeed: 0.08,
    planesSpeed: 5,
    spawnRateSec: 0.1,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east", "west"],
  },
  {
    playerSpeed: 0.06,
    planesSpeed: 6,
    spawnRateSec: 0.07,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.04,
    planesSpeed: 7,
    spawnRateSec: 0.03,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.03,
    planesSpeed: 8,
    spawnRateSec: 0.005,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east", "west"],
  },
  {
    playerSpeed: 0.01,
    planesSpeed: 10,
    spawnRateSec: 0.001,
    birdsToPass: 25,
    birdSpawnDirections: ["north", "east", "west", "south"],
  },
];
