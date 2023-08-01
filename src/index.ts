import "./assets/main.scss";
import { resolveCollisions } from "./collisions";
import { IEntity, IVec, RenderFn } from "./contracts";
import { BaseEntity } from "./entities";
import { GameLoop, INIT_ST, PAUSED_ST } from "./gameLoop";
import { preRender } from "./preRender";
import { image1, image2, image3, image4 } from "./pxImages/testImage";
import { Stage } from "./stage";

class Menu {
  el: HTMLElement;
  constructor(selector: string) {
    this.el = document.querySelector(selector);
  }

  show() {
    this.el.classList.add("active");
  }
  hide() {
    this.el.classList.remove("active");
  }
  addOnClick(sel: string, cb: (e: Event) => void) {
    this.el.querySelector(sel).addEventListener("click", cb);
  }
}

//
// -------------- All the folowing code is just for testing the engine -----------------------------
//

const mainMenu = new Menu(".main-menu");

mainMenu.addOnClick("#demo1-run", e => {
  e.preventDefault();
  demo1();
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});

mainMenu.addOnClick("#demo2-run", e => {
  e.preventDefault();
  demo2();
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.addOnClick("#demo3-run", e => {
  e.preventDefault();
  demo3();
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.show();

const spots = [
  [0, -5],
  [-2, -11],
  [-6, 0],
  [6, 0],
  [-12, -5],
  [6, -10],
  [12, -5],
];

const drawMush: RenderFn = (ctx, pos) => {
  let [x, y] = pos;
  x = Math.round(x);
  y = Math.round(y);
  const w = 8;
  const tw = 12;
  const sr = 3;
  // bottom part
  const m = new Path2D();
  m.moveTo(x - w, y);
  m.arc(x, y, w, 0, Math.PI, false);
  ctx.fillStyle = "#fff";
  ctx.fill(m);
  ctx.stroke(m);
  // Top part

  const mt = new Path2D();
  mt.moveTo(x - tw, y);
  mt.arc(x, y, tw, 0, Math.PI, true);
  ctx.fillStyle = "red";
  ctx.fill(mt);
  ctx.stroke(mt);

  ctx.save();
  ctx.clip(mt);
  //   ctx.clip(clip);
  const ms = new Path2D();
  spots.forEach(p => {
    const [vx, vy] = p;
    ms.moveTo(x + vx + sr, y + vy);
    ms.arc(x + vx, y + vy, sr, 0, 2 * Math.PI, false);
  });
  ctx.fillStyle = "#fff";
  ctx.fill(ms);
  ctx.stroke(ms);
  ctx.restore();
};

const stage = new Stage();
const gl = new GameLoop(stage);

const mushImg = preRender([28, 26], drawMush);

const pause = document.querySelector(".pause");
pause.addEventListener("click", e => {
  e.preventDefault();
  gl.pause();
});

gl.onStart(() => {
  pause.classList.add("active");
  mainMenu.hide();
});
gl.onResume(() => {
  pause.classList.add("active");
  mainMenu.hide();
});
gl.onPause(() => {
  pause.classList.remove("active");
  mainMenu.show();
});

function demo1() {
  class AnimationTest extends BaseEntity {
    constructor(...args: ConstructorParameters<typeof BaseEntity>) {
      super(...args);
    }
    render(t) {
      this.stage.ctx.drawImage(mushImg, this.pos[0], this.pos[1]);
      super.render(t);

      // if (this.box)
    }
    update(d: number) {
      const [x, y] = this.pos;
      if (x < 0 || x > this.stage.canvas.width) {
        this.v[0] = -this.v[0];
      }
      if (y < 0 || y > this.stage.canvas.height) {
        this.v[1] = -this.v[1];
      }
      super.update(d);
    }
    onCollide(e: IEntity) {
      this.v = [-this.v[0], -this.v[1]];
    }
  }
  const entities = [];

  const entitiesNum = 100;
  for (let i = 0; i < entitiesNum; i++) {
    const anim = new AnimationTest(
      stage,
      [
        Math.floor(Math.random() * stage.canvas.width),
        Math.floor(Math.random() * stage.canvas.height),
        //   stage.canvas.width / 2,
        //   stage.canvas.height / 2,
      ],
      [Math.floor(Math.random() * 60) - 30, Math.floor(Math.random() * 60) - 30]
    );
    anim.box = [28, 25];
    entities.push(anim);
  }

  gl.onUpdate(delta => {
    const canCollide = entities.filter(e => !!e.box);
    resolveCollisions(canCollide);
    entities.filter(e => typeof e.update === "function").forEach(e => e.update(delta));
  });
  gl.onRender(t => {
    entities.filter(e => e.hasRender && typeof e.render === "function").forEach(e => e.render(t));
  });
}

function demo2() {
  class AnimationTest extends BaseEntity {
    toRemove: boolean;
    constructor(...args: ConstructorParameters<typeof BaseEntity>) {
      super(...args);
      this.toRemove = false;
      this.mass = 1;
      this.box = [28, 25];
    }
    render(t) {
      this.stage.ctx.drawImage(mushImg, this.pos[0], this.pos[1]);
      super.render(t);
    }
    update(d: number) {
      const [x, y] = this.pos;
      if (x < 0 || x > this.stage.canvas.width) {
        this.v[0] = -this.v[0];
      }
      if (y > this.stage.canvas.height) {
        this.destroy();
      }
      super.update(d);
    }
    onCollide(e: IEntity) {
      //   this.v = [-this.v[0], -this.v[1]];
    }

    destroy() {
      this.toRemove = true;
    }
  }
  let entities = [];

  const entitiesNum = 100;
  for (let i = 0; i < entitiesNum; i++) {
    const anim = new AnimationTest(stage, [Math.floor(Math.random() * stage.canvas.width), 100], [0, 0]);

    entities.push(anim);
  }

  gl.onUpdate(delta => {
    entities = entities.filter(e => !e.toRemove);
    const canCollide = entities.filter(e => !!e.box);
    resolveCollisions(canCollide);
    entities.filter(e => typeof e.update === "function").forEach(e => e.update(delta));

    if (entities.length < entitiesNum) {
      const anim = new AnimationTest(
        stage,
        [Math.floor(Math.random() * stage.canvas.width), Math.floor(Math.random() * stage.canvas.height)],
        [0, 0]
      );

      entities.push(anim);
    }
  });
  gl.onRender(t => {
    entities.filter(e => e.hasRender && typeof e.render === "function").forEach(e => e.render(t));
  });
}

function demo3() {
  function genDrawCharacter(charGrid: string[][]) {
    const drawCharacter: RenderFn = (ctx, pos) => {
      const px = 2;
      let [xInit, yInit] = pos;
      xInit -= (charGrid[0].length * px) / 2;
      yInit -= (charGrid.length * px) / 2;
      for (let r = 0; r < charGrid.length; r++) {
        for (let c = 0; c < charGrid[r].length; c++) {
          if (charGrid[r][c] !== "n") {
            const x = xInit + c * px;
            const y = yInit + r * px;
            ctx.beginPath();
            ctx.fillStyle = charGrid[r][c];
            ctx.fillRect(x, y, px, px);
            ctx.closePath();
          }
        }
      }
    };
    return drawCharacter;
  }

  const idle1 = preRender([32, 32], genDrawCharacter(image1));
  const idle2 = preRender([32, 32], genDrawCharacter(image2));

  const run1 = preRender([32, 32], genDrawCharacter(image3));
  const run2 = preRender([32, 32], genDrawCharacter(image4));

  const charSprite = {
    idle: { frames: [idle1, idle2], changeTime: 500 },
    run: { frames: [run1, run2], changeTime: 100 },
  };
  class AnimationTest extends BaseEntity {
    spriteTime: number;
    currentFrame: number;
    currentSprite: string;
    direction: number;
    constructor(...args: ConstructorParameters<typeof BaseEntity>) {
      super(...args);
      this.spriteTime = 0;
      this.currentFrame = 0;
      this.direction = 1;

      document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") {
          // this.v[0] = Math.max(this.v[0] - 10, -100);
          this.v[0] = -70;
          console.log("left", this.v[0]);
          this.direction = 1;
          this.currentSprite = "run";
        } else if (e.key === "ArrowRight") {
          // this.v[0] = Math.max(this.v[0] - 10, -100);
          this.v[0] = 70;
          console.log("Right", this.v[0]);
          this.currentSprite = "run";
          this.direction = -1;
        }
      });

      document.addEventListener("keyup", e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          this.v[0] = 0;
          this.currentSprite = "idle";
        }
      });
    }
    renderSprite(delta, spriteName: string) {
      const sprite = charSprite[spriteName];
      if (this.spriteTime > sprite.changeTime) {
        this.spriteTime = 0;
        this.currentFrame = (this.currentFrame + 1) % sprite.frames.length;
      }

      this.stage.ctx.save();
      const flip = this.direction === -1;
      this.stage.ctx.scale(flip ? -1 : 1, 1);

      this.stage.ctx.drawImage(
        sprite.frames[this.currentFrame],
        flip ? this.pos[0] * -1 - sprite.frames[this.currentFrame].width : this.pos[0],
        this.pos[1],
        sprite.frames[this.currentFrame].width,
        sprite.frames[this.currentFrame].height
      );
      this.stage.ctx.restore();
    }

    render(delta) {
      this.spriteTime += delta;

      const spriteName = this.currentSprite || "idle";
      this.renderSprite(delta, spriteName);
      // drawCharacter(this.stage.ctx, this.pos);
      super.render(delta);

      // if (this.box)
    }
    update(d: number) {
      const [x, y] = this.pos;
      if (x < 0 || x > this.stage.canvas.width) {
        this.v[0] = -this.v[0];
      }
      if (y < 0 || y > this.stage.canvas.height) {
        this.v[1] = -this.v[1];
      }
      super.update(d);
    }
    onCollide(e: IEntity) {
      this.v = [-this.v[0], -this.v[1]];
    }
  }
  const entities = [];

  const entitiesNum = 1;
  for (let i = 0; i < entitiesNum; i++) {
    const anim = new AnimationTest(stage, [stage.canvas.width / 2, stage.canvas.height / 2], [0, 0]);
    anim.box = [32, 32];
    entities.push(anim);
  }

  gl.onUpdate(delta => {
    const canCollide = entities.filter(e => !!e.box);
    resolveCollisions(canCollide);
    entities.filter(e => typeof e.update === "function").forEach(e => e.update(delta));
  });
  gl.onRender(t => {
    entities.filter(e => e.hasRender && typeof e.render === "function").forEach(e => e.render(t));
  });
}
demo3();
gl.start();
