import "./assets/main.scss";
import { IEntity, IVec, RenderFn } from "./contracts";
import { BaseEntity, collideSize, isCollide } from "./entities";
import { GameLoop } from "./gameLoop";
import { preRender } from "./preRender";
import { Stage } from "./stage";

//
// -------------- All the folowing code is just for testing the engine -----------------------------
//

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
  spots.forEach((p) => {
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

const entities = [];

const entitiesNum = 100;

const mushImg = preRender([28, 26], drawMush);
class AnimationTest extends BaseEntity {
  constructor(...args: ConstructorParameters<typeof BaseEntity>) {
    super(...args);
  }
  render() {
    this.stage.ctx.drawImage(mushImg, this.pos[0], this.pos[1]);
    super.render();

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

const resolveCollisions = (entities: IEntity[], dept = 0) => {
  for (let i = 0; i < entities.length; i++) {
    const a = entities[i];
    for (let j = 0; j < entities.length; j++) {
      if (i !== j) {
        const b = entities[j];
        const willCollide = isCollide(
          [a.pos[0] + a.lastMv[0] * 1.5, a.pos[1] + a.lastMv[1] * 1.5],
          a.box,
          [b.pos[0] + b.lastMv[0] * 1.5, b.pos[1] + b.lastMv[1] * 1.5],
          b.box
        );
        const actualCollide = isCollide(
          [a.pos[0], a.pos[1]],
          a.box,
          [b.pos[0], b.pos[1]],
          b.box
        );

        if (actualCollide && a.v) {
          let nPos: IVec = a.pos;
          do {
            const mvX = -a.lastMv[0] || 1;
            const mvY = -a.lastMv[0] || 1;
            nPos = [nPos[0] + mvX, nPos[1] + mvY];
          } while (isCollide(nPos, a.box, [b.pos[0], b.pos[1]], b.box));
          a.pos = nPos;
        } else if (!actualCollide && willCollide && a.v) {
          // Trigger on Collide!!!!
          a.onCollide(b);
        }
      }
    }
  }
};

gl.onUpdate((delta) => {
  const canCollide = entities.filter((e) => !!e.box);
  resolveCollisions(canCollide);
  entities
    .filter((e) => typeof e.update === "function")
    .forEach((e) => e.update(delta));

  //   if (delta > 10000) {
  //     alert("Game automatically paused!");
  //   }
});
gl.onRender((_) => {
  entities
    .filter((e) => e.hasRender && typeof e.render === "function")
    .forEach((e) => e.render());
});
gl.start();
