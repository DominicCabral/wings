import p5 from "p5";

export class Group {
  GroupSprite: any;
  ani: string;
  debug: any;
  push(s: Sprite);
  draw();
  removeAll();
  collides(s: Sprite, f: (s: Sprite) => void);
  overlaps(g: Group);
  addAni(name: string, animation: any);
  cull(
    top: number,
    bottom: number,
    l: number,
    r: number,
    cb: (s: Sprite) => void
  );
}

type Collider = "static" | "kinematic" | "dynamic" | "none";

export class Sprite {
  direction: number;
  speed: number;
  shapeColor: any;
  x: number;
  y: number;
  w: number;
  h: number;
  img: string;
  layer: number;
  diameter: number;
  collider: Collider;
  rotation: number;
  debug: any;
  ani: any;
  addAni(name: string, animation: any);
  changeAni(l: string);
  draw();
  overlaps(g: Group);
  collides(g: Group, f: () => void);
  move(n: number, s: string, v: number);
  remove();
  moveTowards(x: number, y: number, amount: number);
}

export class Mouse {
  pressing();
}

export class p5Play extends p5 {
  kb: any;
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

  loadAnimation(...args);

  mouse: Mouse;
}
