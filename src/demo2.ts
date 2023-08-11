import { GravityComponent, ImgRenderComponent, PositionComponent } from "./api/components";
import { IVec } from "./api/contracts";
import { ComponentBaseEntity } from "./api/entities";
import { GameState } from "./api/gameState";
import { Stage } from "./api/stage";

export function demo2(gameState: GameState, mushImg) {
  gameState.setEntities([]);
  const { stage, gl } = gameState;
  class MushEntity extends ComponentBaseEntity {
    toRemove: boolean = false;
    constructor(stage: Stage, p: IVec) {
      const v: IVec = [0, 0];
      const position = new PositionComponent(p, v);
      const render = new ImgRenderComponent(mushImg);
      const gravity = new GravityComponent();

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

  const entitiesNum = 1000;

  gl.onUpdate(delta => {
    gameState.setEntities(gameState.getEntities().filter(e => !(e as MushEntity).toRemove));

    gameState.getEntities().forEach(e => e.update(delta));
    if (gameState.getEntities().length < entitiesNum) {
      const anim = new MushEntity(stage, [Math.floor(Math.random() * stage.canvas.width), 0]);

      gameState.addEntity(anim);
    }
  });
  gl.onRender(t => {
    gameState
      .getEntities()
      .filter(e => typeof e.render === "function")
      .forEach(e => e.render(t));
  });
}
