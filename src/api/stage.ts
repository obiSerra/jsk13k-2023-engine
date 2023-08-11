import { IStage } from "./contracts";
import { d } from "./dom";

export class Stage implements IStage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor() {
    this.canvas = d.querySelector("#stage");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
  }
}
