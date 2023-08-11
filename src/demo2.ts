import { GravityComponent, ImgRenderComponent, PositionComponent } from "./api/components";
import { IVec } from "./api/contracts";
import { ComponentBaseEntity } from "./api/entities";
import { Stage } from "./api/stage";

export function demo2(stage, gl, mushImg) {
  class MushEntity extends ComponentBaseEntity {
    toRemove: boolean = false;
    constructor(stage: Stage, p: IVec) {
      const v: IVec = [0, 0];
      const position = new PositionComponent(p, v);
      const render = new ImgRenderComponent(mushImg);
      const gravity = new GravityComponent();
      // const box = new BoxColliderComponent([32, 32], () => {
      //   const pos = this.components["position"] as PositionComponent;
      //   const c = this.getComponent<BoxColliderComponent>("collider");
      //   if (!c.isColliding) {
      //     pos.p = [...pos.lp];
      //     pos.v = [-pos.v[0], -pos.v[1]];
      //   }
      //   this.isColliding = true;
      // });

      super(stage, [position, render, gravity]);
    }
    update(d: number) {
      const { p, v } = this.getComponent<PositionComponent>("position");
      const [x, y] = p;
      if (y > this.stage.canvas.height) {
        this.toRemove = true;
      }
      super.update(d);
    }
  }

  let entities = [];

  const entitiesNum = 1000;
  // for (let i = 0; i < entitiesNum; i++) {
  //   const anim = new MushEntity(stage, [Math.floor(Math.random() * stage.canvas.width), 100]);

  //   entities.push(anim);
  // }

  gl.onUpdate(delta => {
    entities = entities.filter(e => !e.toRemove);

    entities.forEach(e => e.update(delta));
    if (entities.length < entitiesNum) {
      const anim = new MushEntity(stage, [Math.floor(Math.random() * stage.canvas.width), 0]);

      entities.push(anim);
    }
  });
  gl.onRender(t => {
    entities.filter(e => typeof e.render === "function").forEach(e => e.render(t));
  });
}
