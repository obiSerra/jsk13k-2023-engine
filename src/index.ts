import "./assets/main.scss";
import { resolveCollisions, resolveCollisionsComponent } from "./collisions";
import { IEntity, IVec, RenderFn, Sprite } from "./contracts";
import { demo3 } from "./demo3";
import {
  BaseEntity,
  BoxColliderComponent,
  ComponentBaseEntity,
  ImgRenderComponent,
  PositionComponent,
} from "./entities";
import { GameLoop, INIT_ST, PAUSED_ST } from "./gameLoop";
import { images } from "./pxImages/testImage";
import { genDrawCharacter, preRender, hydrateImage } from "./rendering";
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
  demo1(stage, gl);
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
  demo3(stage, gl);
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

function demo1(stage, gl) {
  class MushEntity extends ComponentBaseEntity {
    isColliding: boolean;
    constructor(stage: Stage, p: IVec) {
      const v: IVec = [Math.floor(Math.random() * 60) - 30, Math.floor(Math.random() * 60) - 30];
      const position = new PositionComponent(p, v);
      const render = new ImgRenderComponent(mushImg);
      const box = new BoxColliderComponent([32, 32], () => {
        const pos = this.components["position"] as PositionComponent;
        const c = this.getComponent<BoxColliderComponent>("collider");
        if (!c.isColliding) {
          pos.p = [...pos.lp];
          pos.v = [-pos.v[0], -pos.v[1]];
        }
        this.isColliding = true;
      });

      super(stage, [position, render, box]);
      this.isColliding = false;
    }
    update(d: number) {
      const { p, v } = this.getComponent<PositionComponent>("position");
      const [x, y] = p;
      // this.isColliding = false;
      // TODO should consider the size of the image
      if (x < 0 || x > this.stage.canvas.width) {
        v[0] = -v[0];
      }
      if (y < 0 || y > this.stage.canvas.height) {
        v[1] = -v[1];
      }
      super.update(d);
    }
  }
  const entities = [];

  const entitiesNum = 200;
  for (let i = 0; i < entitiesNum; i++) {
    const p: IVec = [Math.floor(Math.random() * stage.canvas.width), Math.floor(Math.random() * stage.canvas.height)];
    const anim = new MushEntity(stage, p);

    entities.push(anim);
  }

  gl.onUpdate(delta => {
    const canCollide = entities.filter(e => !!e.components["collider"]);

    // to update
    resolveCollisionsComponent(canCollide);
    entities.filter(e => typeof e.update === "function").forEach(e => e.update(delta));
  });
  gl.onRender(t => {
    entities.filter(e => typeof e.render === "function").forEach(e => e.render(t));
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

demo1(stage, gl);
gl.start();
