import { IEntity, IStage, IVec, Sprite, SpriteAnimator } from "./contracts";
import { mXs } from "./utils";

const gravity = (e: IEntity, d: number) => {
  if (!!e.mass) {
    e.v[1] += Math.min(e.mass * 5, e.v[1] + mXs(e.mass, d));
  }
};

const spriteAnimator = {};

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

  spriteAnimator: SpriteAnimator;
  constructor(stage: IStage, pos?: IVec, v?: IVec) {
    this.hasRender = true;
    this.stage = stage;
    this.pos = pos;
    this.v = v;
    this.boxcolor = "lime";
    this.lastMv = [0, 0];
    this.isColliding = false;
  }

  setSpriteAnimator(spriteAnimator: SpriteAnimator) {
    this.spriteAnimator = spriteAnimator;
  }

  update(d: number) {
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

    this.stage.ctx.drawImage(
      sprite.frames[sa.currentFrame],
      flip ? this.pos[0] * -1 - sprite.frames[sa.currentFrame].width : this.pos[0],
      this.pos[1],
      sprite.frames[sa.currentFrame].width,
      sprite.frames[sa.currentFrame].height
    );
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
}
