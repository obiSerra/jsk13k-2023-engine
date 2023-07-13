import { IDynEntity, IStage, IVec } from "./contracts";
import { mXs } from "./utils";

export class BaseEntity implements IDynEntity {
  stage: IStage;
  pos: IVec;
  v: IVec;

  constructor(stage: IStage, pos: IVec) {
    this.stage = stage;
    this.pos = pos;
    this.v = [0, 0];
  }

  render() {}
  update(d: number) {
    const [x, y] = this.pos;
    const [vx, vy] = this.v;

    this.pos = [x + mXs(vx, d), y + mXs(vy, d)];
  }
}
