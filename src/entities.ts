import { ComponentType, GameStateAPI, IComponent, IEntity, IStage, IVec, Sprite, SpriteAnimator } from "./contracts";
import { mXs } from "./utils";

const gravity = (e: IEntity, d: number) => {
  if (!!e.mass) {
    e.v[1] += Math.min(e.mass * 5, e.v[1] + mXs(e.mass, d));
  }
};

const spriteAnimator = {};

// TODO simplify this
export class BaseEntity implements IEntity {
  ID: string;
  components: { [key: string]: IComponent };
  stage: IStage;

  pos: IVec;
  v: IVec;
  lastMv: IVec;
  hasRender: boolean;
  box: IVec;
  boxcolor: string;
  isColliding: boolean;
  mass?: number;

  spriteAnimator: SpriteAnimator;
  constructor(stage: IStage, pos?: IVec, v?: IVec) {
    this.ID = Math.random().toString(36).substr(2, 9);
    this.components = {};
    this.stage = stage;

    this.hasRender = true;
    this.pos = pos;
    this.v = v;
    this.boxcolor = "lime";
    this.lastMv = [0, 0];
    this.isColliding = false;
  }

  setSpriteAnimator(spriteAnimator: SpriteAnimator) {
    this.spriteAnimator = spriteAnimator;
  }

  update(d: number, gameStateApi?: GameStateAPI) {
    if (!this.pos || !this.v) return;
    const [x, y] = this.pos;
    const [vx, vy] = this.v;
    this.lastMv = [mXs(vx, d), mXs(vy, d)];
    gravity(this, d);
    this.pos = [x + mXs(vx, d), y + mXs(vy, d)];
  }
  renderSprite(delta, spriteName: string) {
    if (!this.spriteAnimator) return;
    const sa = this.spriteAnimator;
    const charSprite = sa.charSprite;
    const sprite = charSprite[spriteName];
    if (sa.spriteTime > sprite.changeTime) {
      sa.spriteTime = 0;
      sa.currentFrame = (sa.currentFrame + 1) % sprite.frames.length;
    }

    this.stage.ctx.save();
    const flip = sa.direction === -1;
    this.stage.ctx.scale(flip ? -1 : 1, 1);

    const positionX = flip ? this.pos[0] * -1 - sprite.frames[sa.currentFrame].width : this.pos[0];

    this.stage.ctx.drawImage(
      sprite.frames[sa.currentFrame],
      positionX,
      this.pos[1],
      sprite.frames[sa.currentFrame].width,
      sprite.frames[sa.currentFrame].height
    );
    this.stage.ctx.strokeStyle = "red";

    this.stage.ctx.arc(positionX, this.pos[1], 2, 0, 2 * Math.PI);
    this.stage.ctx.stroke();

    this.stage.ctx.restore();
  }
  render(t: number) {
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

  getComponent<T extends IComponent>(type: ComponentType): T {
    return null;
  }
}

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

  constructor(box: IVec, onCollide?: (e: IEntity) => void) {
    this.type = "collider";
    this.box = box;
    this.trigger = true;
    this.onCollideFn = onCollide;
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

  pos: IVec;

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
    console.log("init component", name);
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
