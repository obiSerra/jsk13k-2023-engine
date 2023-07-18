import { IEntity, IStage, IVec } from "./contracts";
import { mXs } from "./utils";

const gravity = (e: IEntity, d: number) => {
  if (!!e.mass) {
    e.v[1] += Math.min(e.mass * 5, e.v[1] + mXs(e.mass, d));
  }
};
export class BaseEntity implements IEntity {
  stage: IStage;
  pos: IVec;
  v: IVec;
  lastMv: IVec;
  hasRender: boolean;
  box: IVec;
  boxcolor: string;
  isColliding: boolean;
  mass?: number;
  constructor(stage: IStage, pos?: IVec, v?: IVec) {
    this.hasRender = true;
    this.stage = stage;
    this.pos = pos;
    this.v = v;
    this.boxcolor = "lime";
    this.lastMv = [0, 0];
    this.isColliding = false;
  }

  update(d: number) {
    if (!this.pos || !this.v) return;
    const [x, y] = this.pos;
    const [vx, vy] = this.v;
    this.lastMv = [mXs(vx, d), mXs(vy, d)];
    gravity(this, d);
    this.pos = [x + mXs(vx, d), y + mXs(vy, d)];
  }
  render() {
    this.boxcolor = this.isColliding ? "red" : "lime";
    if (this.box) {
      const [w, h] = this.box;
      this.stage.ctx.beginPath();
      this.stage.ctx.rect(this.pos[0], this.pos[1], w, h);
      this.stage.ctx.strokeStyle = this.boxcolor;
      this.stage.ctx.stroke();
      // if (this.boxcolor !== "lime") debugger;
    }
    return;
  }
  onCollide(e: IEntity) {}
  destroy() {}
}
