import p5 from "p5";

export class Group {
  constructor();
  push(s: Sprite);
  draw();
  removeAll();
}

type Collider = "static" | "kinematic" | "dynamic" | "none";

export class Sprite {
  direction: number;
  speed: number;
  shapeColor: any;
  draw();
  collides(g: Group, f: () => void);
}

export class p5Play extends p5 {
  createGroup(): Group;
  createSprite(x: number, y: number, w: number, h: number): Sprite;

  createSprite(
    x: number,
    y: number,
    w: number,
    h: number,
    collider: Collider
  ): Sprite;

  createSprite(x: number, y: number, w: number, collider: Collider): Sprite;

  createSprite(x: number, y: number, w: number): Sprite;
}
