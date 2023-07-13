import "./assets/main.scss";
import { IVec, RenderFn } from "./contracts";
import { BaseEntity } from "./entities";
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

const entitiesNum = 400;

const mushImg = preRender([28, 26], drawMush);
class AnimationTest extends BaseEntity {
  constructor(v: IVec, ...args: ConstructorParameters<typeof BaseEntity>) {
    super(...args);
    this.v = v;
  }
  render() {
    this.stage.ctx.drawImage(mushImg, this.pos[0], this.pos[1]);
  }
  update(d) {
    const [x, y] = this.pos;
    if (x < 0 || x > this.stage.canvas.width) {
      this.v[0] = -this.v[0];
    }
    if (y < 0 || y > this.stage.canvas.height) {
      this.v[1] = -this.v[1];
    }
    super.update(d);
  }
}

for (let i = 0; i < entitiesNum; i++) {
  entities.push(
    new AnimationTest(
      [
        Math.floor(Math.random() * 60) - 30,
        Math.floor(Math.random() * 60) - 30,
      ],
      stage,
      [
        Math.floor(Math.random() * stage.canvas.width),
        Math.floor(Math.random() * stage.canvas.height),
      ]
    )
  );
}

gl.onUpdate((delta) => {
  entities.forEach((e) => e.update(delta));
  //   if (delta > 10000) {
  //     alert("Game automatically paused!");
  //   }
});
gl.onRender((_) => {
  entities.forEach((e) => e.render());
});
gl.start();
