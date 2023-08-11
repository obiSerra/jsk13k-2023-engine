import {
  IComponent,
  IVec,
  GameStateAPI,
  IEntity,
  ComponentType,
  Sprite,
  IStage,
  Note,
  NodeDataFixed,
} from "./contracts";
import { Sound, notes } from "./soundComponent";
import { mXs } from "./utils";

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

const noteToTone = (note: string) => {
  const oct = note.replace(/.*([0-9]+).*/g, "$1");
  const tone = note.replace(/[0-9]/gi, "");
  const freqs = notes[parseInt(oct)] || notes[0];
  const freq = freqs[tone];
  if (typeof freq === "undefined") {
    console.error(`Note ${note} not found`);
    return 0;
  }
  return freq;
};

export class SoundComponent implements IComponent {
  type: ComponentType;
  sound: Sound;
  channels: number | (string | null)[];
  volume: number = 0.5;

  constructor(channels: number | (string | null)[] = 3) {
    this.type = "sound";
    this.sound = new Sound(channels);
    this.channels = channels;
  }

  playChannel(channel: string, music: NodeDataFixed[]) {
    music
      .reduce(
        (acc, v: NodeDataFixed) => {
          v.s = v.s || acc.t;
          acc.t += v.d + v.p;
          acc.n.push(v);
          return acc;
        },
        { t: music[0].s, n: [] }
      )
      .n.forEach((n: NodeDataFixed, i) => {
        const f = noteToTone(n.n);

        setTimeout(() => {
          this.sound.playNote(channel, f, n.d, this.volume);
        }, n.s);
      });
  }

  play(music: Note[]) {
    const perChannel = music.reduce((acc, v: Note) => {
      const ch = v.c.toString() || "0";
      acc[ch] = acc[ch] || [];
      acc[ch].push(v);
      return acc;
    }, {});

    for (let k of Object.keys(perChannel)) {
      const channelMusic = perChannel[k];
      this.playChannel(k, channelMusic);
    }
  }
}
