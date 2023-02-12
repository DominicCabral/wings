import { Orientation } from "./orientation";

export type LevelConfig = {
  playerSpeed: number;
  planesSpeed: number;
  spawnRateSec: number;
  birdSpawnDirections: Orientation[];
  planesToPass: number;
};

export type Levels = LevelConfig[];
export const DEFAULT_LEVELS: Levels = [
  {
    playerSpeed: 0.1,
    planesSpeed: 4,
    spawnRateSec: 0.5,
    planesToPass: 25,
    birdSpawnDirections: ["north"],
  },
  {
    playerSpeed: 0.08,
    planesSpeed: 5,
    spawnRateSec: 0.1,
    planesToPass: 25,
    birdSpawnDirections: ["north"],
  },
  {
    playerSpeed: 0.06,
    planesSpeed: 6,
    spawnRateSec: 0.07,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.04,
    planesSpeed: 7,
    spawnRateSec: 0.03,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east"],
  },
  {
    playerSpeed: 0.03,
    planesSpeed: 8,
    spawnRateSec: 0.005,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east", "west"],
  },
  {
    playerSpeed: 0.01,
    planesSpeed: 10,
    spawnRateSec: 0.001,
    planesToPass: 25,
    birdSpawnDirections: ["north", "east", "west", "south"],
  },
];
