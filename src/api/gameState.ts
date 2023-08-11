import { IEntity, GameStateAPI } from "./contracts";
import { GameLoop } from "./gameLoop";
import { Stage } from "./stage";

export class GameState {
  status: string = "loading";
  entities: { [key: string]: IEntity } = {};
  stage: Stage;
  gl: GameLoop;

  addEntity(e: IEntity) {
    this.entities[e.ID] = e;
  }
  removeEntity(e: IEntity) {
    this.entities[e.ID].destroy();
    delete this.entities[e.ID];
  }
  getEntities() {
    return Object.values(this.entities);
  }
  setEntities(e: IEntity[]) {
    if (Object.keys(this.entities).length > 0) {
      Object.values(this.entities).map(e => e.destroy());
    }
    this.entities = e.reduce((acc, e) => ({ ...acc, [e.ID]: e }), {});
  }

  stateAPI(): GameStateAPI {
    return {
      addEntity: this.addEntity.bind(this),
      removeEntity: this.removeEntity.bind(this),
      getEntities: this.getEntities.bind(this),
      getStage: () => this.stage,
    };
  }
}
