import { ComponentType, GameStateAPI, IComponent, IEntity, IStage, IVec, Sprite, SpriteAnimator } from "./contracts";
import { mXs } from "./utils";

const gravity = (e: IEntity, d: number) => {
  if (!!e.mass) {
    e.v[1] += Math.min(e.mass * 5, e.v[1] + mXs(e.mass, d));
  }
};

const spriteAnimator = {};

export class ComponentBaseEntity implements IEntity {
  ID: string;
  stage: IStage;
  components: { [key: string]: IComponent };
  hasRender: boolean;

  lastMv: IVec;
  isColliding: boolean;

  constructor(stage: IStage, components: IComponent[]) {
    this.ID = Math.random().toString(36).substr(2, 9);
    this.stage = stage;
    this.components = components.reduce((acc, c) => ({ ...acc, [c.type]: c }), {});
    this.componentList().forEach(c => this.initComponent(c.type));
  }
  initComponent(name: string) {
    // console.log("init component", name);
    if (this.components[name].onInit) this.components[name].onInit(this);
  }
  componentList() {
    return Object.keys(this.components).map(k => this.components[k]);
  }
  getComponent<T extends IComponent>(name: string): T {
    return (this.components[name] as T) || null;
  }

  addComponent(c: IComponent) {
    this.components[c.type] = c;
    this.initComponent(c.type);
  }

  render(t: number): void {
    this.componentList().forEach(c => {
      if (c.onRender) c.onRender(this, t);
    });
  }
  onUpdateStart?(delta: number, gameState?: GameStateAPI): void {}
  onUpdateEnd?(delta: number, gameState?: GameStateAPI): void {}
  update?(delta: number, gameState?: GameStateAPI): void {
    this?.onUpdateStart(delta, gameState);
    this.componentList().forEach(c => {
      if (c.onUpdate) c.onUpdate(this, delta, gameState);
    });
    this?.onUpdateStart(delta, gameState);
  }
  onCollide(e: IEntity): void {
    throw new Error("Method not implemented.");
  }
  destroy() {
    throw new Error("Method not implemented.");
  }
}
