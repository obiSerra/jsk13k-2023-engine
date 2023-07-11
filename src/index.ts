import { GameLoop, UpdateCb } from "./gameLoop";
import { Stage, IStage } from "./stage";
import "./assets/main.scss";

type IVec = [number, number];

interface IEntity {
  pos: IVec;
  stage: IStage;
  render(): void;
  update(): void;
}

class BaseEntity {
  stage: IStage;
  pos: IVec;
  constructor(stage: IStage, pos: IVec) {
    this.stage = stage;
    this.pos = pos;
  }

  render() {
    const c = this.stage.ctx;
    c.beginPath();
    c.strokeRect(100, 100, 20, 20);
  }
}

const stage = new Stage();
const gl = new GameLoop(stage);

const entities = [new BaseEntity(stage, [100, 100])];

gl.onUpdate((delta) => {
  //   if (delta > 10000) {
  //     alert("Game automatically paused!");
  //   }
});
gl.onRender((_) => {
  entities.forEach((e) => e.render());
});
gl.start();
