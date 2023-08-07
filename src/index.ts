import e = require("express");
import "./assets/main.scss";
import { RenderFn } from "./contracts";
import { demo1 } from "./demo1";
import { demo2 } from "./demo2";
import { demo3 } from "./demo3";
import { GameLoop, INIT_ST, PAUSED_ST } from "./gameLoop";
import { preRender } from "./rendering";
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

// gl.start();
