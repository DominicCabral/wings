import { Group, Sprite, p5Play } from "./p5.play/p5.play";
import p5 from "p5";
const { load } = require("./p5.play/p5.play");

const PLAYER_SPEED = 5;
const GHOST_SPEED = 5;
const SPAWN_RATE_SEC = 0.3;
const GHOST_SIZE = 25;

const sketch = (p5: p5Play) => {
  let ghosts: Group;
  let spr: Sprite;
  let isGameOver = false;
  let interval;

  function gameOver() {
    console.log("GAME OVER");
    isGameOver = true;
    clearInterval(interval);
  }
  function loadGhosts() {
    return setInterval(() => {
      let g = p5.createSprite(p5.random(0, p5.width), 0, GHOST_SIZE);
      g.direction = 90;
      g.speed = GHOST_SPEED;
      g.shapeColor = p5.color(255);
      ghosts.push(g);
    }, 1000 * SPAWN_RATE_SEC);
  }

  p5.setup = () => {
    ghosts = p5.createGroup();
    p5.createCanvas(400, 400);
    spr = p5.createSprite(p5.width / 2, p5.height - 50, 40, "kinematic");
    spr.shapeColor = p5.color(255);

    ghosts = p5.createGroup();
    interval = loadGhosts();
  };

  p5.draw = () => {
    if (isGameOver) {
      return;
    }
    // ghosts.moveTowards(width / 2, height);
    p5.background(50);
    spr.draw();
    ghosts.draw();
    spr.collides(ghosts, gameOver);
  };

  p5.keyPressed = () => {
    if (p5.keyCode == p5.LEFT_ARROW) {
      spr.speed = PLAYER_SPEED;
      spr.direction = 180;
      return;
    } else if (p5.keyCode == p5.RIGHT_ARROW) {
      spr.speed = PLAYER_SPEED;
      spr.direction = 0;
      return;
    }

    if (isGameOver && p5.key == " ") {
      ghosts.removeAll();
      isGameOver = false;
      interval = loadGhosts();
      return;
    }

    return;
  };

  p5.keyReleased = () => {
    spr.speed = 0;
    spr.direction = 0;
  };
};

load(p5);
new p5(sketch);
