import { ComponentType, GameStateAPI, IComponent, IEntity, IStage, IVec, Sprite, SpriteAnimator } from "./contracts";
import { mXs } from "./utils";

const gravity = (e: IEntity, d: number) => {
  if (!!e.mass) {
    e.v[1] += Math.min(e.mass * 5, e.v[1] + mXs(e.mass, d));
  }
};

const spriteAnimator = {};

export class PositionComponent implements IComponent {
  type: "position";
  p: IVec;
  v: IVec;
  lp: IVec;
  direction: number;
  constructor(p: IVec, v: IVec = [0, 0]) {
    this.type = "position";
    this.p = p;
    this.lp = p;
    this.v = v;
    this.direction = 1;
  }

  onUpdate(e, delta: number, gameState?: GameStateAPI): void {
    const [x, y] = this.p;
    this.lp[0] = this.lp[0] === x ? this.lp[0] : x;
    this.lp[1] = this.lp[1] === y ? this.lp[1] : y;

    // Apply movement
    const [vx, vy] = this.v;
    this.p = [x + mXs(vx, delta), y + mXs(vy, delta)];
  }
}

export class BoxColliderComponent implements IComponent {
  type: "collider";
  box: IVec;
  trigger: boolean;
  onCollide?: (e: IEntity) => void;
  onCollideFn?: (e: IEntity) => void;
  isColliding: boolean;

  constructor(box: IVec, onCollide?: (e: IEntity) => void) {
    this.type = "collider";
    this.box = box;
    this.trigger = true;
    this.onCollideFn = onCollide;
    this.isColliding = false;
  }
  onInit(e: IEntity): void {
    this.onCollide = this.onCollideFn?.bind(e) || null;
  }

  onRender(e: IEntity, delta: number): void {
    const [w, h] = this.box;
    const pos = (e.components["position"] as PositionComponent).p;
    if (!pos) throw new Error("PositionComponent not found");
    const [x, y] = pos;
    const ctx = e.stage.ctx;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.strokeStyle = "lime";
    ctx.stroke();
  }
}

export class SpriteRenderComponent implements IComponent {
  type: ComponentType;
  sprite: Sprite;

  stage: IStage;
  time: number;
  currentFrame: number;
  currentAnimation: string;

  constructor(sprite: Sprite, defaultAnimation: string) {
    this.type = "render";
    this.sprite = sprite;
    this.triggerAnimation(defaultAnimation);
  }
  onInit(e: IEntity): void {
    this.stage = e.stage;
  }
  triggerAnimation(animationName: string) {
    this.time = 0;
    this.currentFrame = 0;
    this.currentAnimation = animationName;
  }
  onRender(e: IEntity, t: number): void {
    const pos = (e.components["position"] as PositionComponent).p;
    if (!pos) throw new Error("PositionComponent not found");
    const [x, y] = pos;

    const an = this.sprite[this.currentAnimation];
    this.time += t;
    if (this.time > an.changeTime) {
      this.time = 0;
      this.currentFrame = (this.currentFrame + 1) % an.frames.length;
    }
    const ctx = this.stage.ctx;

    ctx.beginPath();
    ctx.drawImage(
      an.frames[this.currentFrame],
      x,
      y,
      an.frames[this.currentFrame].width,
      an.frames[this.currentFrame].height
    );
    ctx.strokeStyle = "red";
    ctx.moveTo(x, y);
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
}

export class ImgRenderComponent implements IComponent {
  type: ComponentType;
  stage: IStage;
  image: HTMLImageElement;

  pos: IVec;

  constructor(image: HTMLImageElement) {
    this.type = "render";
    this.image = image;
  }
  onInit(e: IEntity): void {
    this.stage = e.stage;
  }

  onRender(e: IEntity, delta: number): void {
    const pos = (e.components["position"] as PositionComponent).p;
    this.stage.ctx.drawImage(this.image, pos[0], pos[1]);
  }
}

export class GravityComponent implements IComponent {
  type: ComponentType;
  gravity: number;
  ev: number;
  constructor(gravity: number = 12, ev: number = null) {
    this.type = "gravity";
    this.gravity = gravity;
    this.ev = !!ev ? ev : gravity * 10;
  }
  onUpdate(e: IEntity, delta: number): void {
    const pos = (e.components["position"] as PositionComponent).p;
    const [x, y] = pos;
    const v = (e.components["position"] as PositionComponent).v;
    const accV = Math.max(v[1] + mXs(this.gravity, delta), this.ev);
    (e.components["position"] as PositionComponent).v = [v[0], accV];
  }
}

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
