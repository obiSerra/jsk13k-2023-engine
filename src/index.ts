import { MenuComponent, SoundComponent } from "./api/components";
import { RenderFn } from "./api/contracts";
import { ComponentBaseEntity } from "./api/entities";
import { GameLoop, INIT_ST, PAUSED_ST } from "./api/gameLoop";
import { GameState } from "./api/gameState";
import { Menu } from "./api/menu";
import { preRender } from "./api/rendering";
import { genMusicSheet } from "./api/soundComponent";
import { Stage } from "./api/stage";
import "./assets/main.scss";
import { demo1 } from "./demo1";
import { demo2 } from "./demo2";
import { demo3 } from "./demo3";

const stage = new Stage();
const gl = new GameLoop(stage);

const gameState = new GameState();
gameState.stage = stage;
gameState.gl = gl;

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
  demo1(gameState, mushImg);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});

mainMenu.addOnClick("#demo2-run", e => {
  e.preventDefault();
  demo2(gameState, mushImg);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.addOnClick("#demo3-run", e => {
  e.preventDefault();
  demo3(gameState);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.addOnClick("#demo4-run", e => {
  e.preventDefault();
  demo4(gameState);
  if (gl.state === INIT_ST) gl.start();
  else if (gl.state === PAUSED_ST) gl.resume();
});
mainMenu.show();

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

function demo4(gameState: GameState) {
  const { stage } = gameState;
  class MusicEntity extends ComponentBaseEntity {
    constructor(stage: Stage) {
      const sound = new SoundComponent(["triangle", "sawtooth", "square"]);
      const menu = new MenuComponent(".music-menu");

      menu.addListener("#sound1", e => this.play(genMusicSheet(300, [{ n: "G4", d: 2, p: 0.5, c: 1 }])));

      super(stage, [sound, menu]);
      this.isColliding = false;
    }
    play(music): void {
      this.getComponent<SoundComponent>("sound").play(music);
    }
  }
  
  gameState.setEntities([new MusicEntity(stage)]);
}
