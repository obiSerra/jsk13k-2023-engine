import { resolveCollisionsComponent } from "./collisions";
import { BoxColliderComponent, ImgRenderComponent, PositionComponent } from "./components";
import { IVec } from "./contracts";
import { ComponentBaseEntity } from "./entities";
import { Stage } from "./stage";

export function demo1(stage, gl, mushImg) {
  class MushEntity extends ComponentBaseEntity {
    isColliding: boolean;
    constructor(stage: Stage, p: IVec) {
      const v: IVec = [Math.floor(Math.random() * 60) - 30, Math.floor(Math.random() * 60) - 30];
      const position = new PositionComponent(p, v);
      const render = new ImgRenderComponent(mushImg);
      const box = new BoxColliderComponent([32, 32], () => {
        const pos = this.components["position"] as PositionComponent;
        const c = this.getComponent<BoxColliderComponent>("collider");
        if (!c.isColliding) {
          pos.p = [...pos.lp];
          pos.v = [-pos.v[0], -pos.v[1]];
        }
        this.isColliding = true;
      });

      super(stage, [position, render, box]);
      this.isColliding = false;
    }
    update(d: number) {
      const { p, v } = this.getComponent<PositionComponent>("position");
      const [x, y] = p;
      // this.isColliding = false;
      // TODO should consider the size of the image
      if (x < 0 || x > this.stage.canvas.width) {
        v[0] = -v[0];
      }
      if (y < 0 || y > this.stage.canvas.height) {
        v[1] = -v[1];
      }
      super.update(d);
    }
  }
  const entities = [];

  const entitiesNum = 200;
  for (let i = 0; i < entitiesNum; i++) {
    const p: IVec = [Math.floor(Math.random() * stage.canvas.width), Math.floor(Math.random() * stage.canvas.height)];
    const anim = new MushEntity(stage, p);

    entities.push(anim);
  }

  gl.onUpdate(delta => {
    const canCollide = entities.filter(e => !!e.components["collider"]);

    // to update
    resolveCollisionsComponent(canCollide);
    entities.filter(e => typeof e.update === "function").forEach(e => e.update(delta));
  });
  gl.onRender(t => {
    entities.filter(e => typeof e.render === "function").forEach(e => e.render(t));
  });
}
