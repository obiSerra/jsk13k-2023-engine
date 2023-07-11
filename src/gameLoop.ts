import { ra, d } from "./dom";
import { IStage } from "./stage";

export type UpdateCb = (delta: number) => void;
const emptyCb: UpdateCb = (_) => {};

export class GameLoop {
  uFps = 1000 / 30;

  debugInfo: HTMLElement;
  stage: IStage;
  updateCb: UpdateCb;
  renderCb: UpdateCb;
  lastRenderCall: number;
  lastUpdateCall: number;
  renderFps: number;
  updateFps: number;
  constructor(stage: IStage) {
    this.stage = stage;
    this.lastRenderCall = 0;
    this.lastUpdateCall = 0;
    this.renderFps = 0;
    this.updateFps = 0;
    this.debugInfoCreate();
  }

  onUpdate(updateCb: UpdateCb) {
    if (updateCb) this.updateCb = updateCb;
  }

  onRender(onRenderCb: UpdateCb) {
    if (onRenderCb) this.renderCb = onRenderCb;
  }
  start() {
    this.mainLoop();
  }

  renderLoop() {
    ra((time: number) => {
      const s = this.stage;
      s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
      const delta = time - this.lastRenderCall;
      this.renderFps = Math.floor(1000 / delta);
      this.renderDebug();
      this.lastRenderCall = time;

      this.renderCb(delta);

      this.renderLoop();
    });
  }

  updateLoop() {
    setTimeout(() => {
      const now = +new Date();

      const delta = now - this.lastUpdateCall;
      this.updateFps = Math.floor(1000 / delta);
      this.lastUpdateCall = now;
      this.updateCb(delta);

      this.updateLoop();
    }, this.uFps);
  }
  mainLoop() {
    this.lastUpdateCall = +new Date();
    this.updateLoop();
    this.renderLoop();
  }

  renderDebug() {
    const dEl = document.querySelector(".debug-info");
    let debugString = this.renderFps.toString() + " rFPS";
    debugString += " /" + this.updateFps.toString() + " uFPS";
    debugString += " (" + (+new Date()).toString() + ")";
    dEl.innerHTML = debugString;
  }

  debugInfoCreate() {
    const debugInfo = d.createElement("div");
    debugInfo.className = "debug-info";
    debugInfo.innerHTML = "Game loop not started yet!";
    d.body.append(debugInfo);
  }
}
