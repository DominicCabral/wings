import p5 from "p5";

export type OrientationConfig = {
  direction: number;
  x: () => number;
  y: () => number;
  rotation: number;
};

export type Orientation = "north" | "west" | "east" | "south";

export function orientationConfig(
  p5: p5
): Record<Orientation, OrientationConfig> {
  return {
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
}
