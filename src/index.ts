import e = require("express");
import "./assets/main.scss";
import { IEntity, IVec, MusicSheet, NoteData, RenderFn } from "./contracts";
import { demo1 } from "./demo1";
import { demo2 } from "./demo2";
import { demo3 } from "./demo3";
import { GameLoop, INIT_ST, PAUSED_ST } from "./gameLoop";
import { preRender } from "./rendering";
import { Stage } from "./stage";
import { d } from "./dom";
import { PositionComponent, ImgRenderComponent, BoxColliderComponent, SoundComponent } from "./components";
import { ComponentBaseEntity } from "./entities";
import { genMusicSheet } from "./soundComponent";

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

const mushImg = preRender([28, 26], drawMush);

const mainMenu = new Menu(".main-menu");

mainMenu.addOnClick("#demo1-run", e => {
  e.preventDefault();
  demo1(stage, gl, mushImg);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});

mainMenu.addOnClick("#demo2-run", e => {
  e.preventDefault();
  demo2(stage, gl, mushImg);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.addOnClick("#demo3-run", e => {
  e.preventDefault();
  demo3(stage, gl);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.addOnClick("#demo4-run", e => {
  e.preventDefault();
  demo4(stage, gl);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.show();

const stage = new Stage();
const gl = new GameLoop(stage);

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

function demo4(stage: Stage, gl: GameLoop) {
  class MusicEntity extends ComponentBaseEntity {
    constructor(stage: Stage) {
      const sound = new SoundComponent(["triangle", "sawtooth", "square"]);

      super(stage, [sound]);
      this.isColliding = false;
    }
    play(music): void {
      // const music = [
      //   { note: "G0", duration: beat(1), volume, pause: beat(0.5) },
      //   { note: "G0", duration: beat(1), volume, pause: beat(0.5) },
      //   { note: "G0", duration: beat(1), volume, pause: beat(0.5) },
      //   { note: "D#0", duration: beat(1.2), volume },
      //   { note: "A#0", duration: beat(0.3), volume, pause: beat(0.5) },
      //   { note: "G0", duration: beat(1), volume },
      //   { note: "D#0", duration: beat(1.2), volume },
      //   { note: "A#0", duration: beat(0.3), volume },
      //   { note: "G0", duration: beat(1), volume, pause: beat(0.5) },
      //   { note: "D1", duration: beat(1), volume },
      //   { note: "D1", duration: beat(1), volume },
      //   { note: "D1", duration: beat(1), volume },
      //   // { note: "D#0", duration: beat(1.2), volume },
      //   // { note: "A#0", duration: beat(0.3), volume },
      //   // { note: "D#0", duration: beat(1), volume },
      // ];

      this.getComponent<SoundComponent>("sound").play(music);
    }
  }

  
  const musicSheet = genMusicSheet(300, [
    { n: "G0", d: 2, p: 0.5, c: 1 },
    { n: "G0", d: 2, p: 0.5, c: 2, s: 2.5 },
    { n: "G0", d: 2, p: 0.5, c: 0, s: 5 },
  ]);

  console.log(musicSheet);

  const musicEntity = new MusicEntity(stage);

  musicEntity.play(musicSheet);
}
