export type IVec = [number, number];

export interface IEntity {
  ID: string;
  stage: IStage;
  hasRender: boolean;
  pos?: IVec;
  v?: IVec;
  box?: IVec;
  lastMv: IVec;
  isColliding: boolean;
  mass?: number;
  render?(t: number): void;
  update?(delta: number, gameState?: GameStateAPI): void;
  onCollide(e: IEntity): void;
  destroy();
}
export interface IStage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export type RenderFn = (ctx: CanvasRenderingContext2D, pos: IVec) => void;

export type SpriteFrame = {
  frames: HTMLImageElement[];
  changeTime: number;
};

export type Sprite = {
  [key: string]: SpriteFrame;
};

export type SpriteAnimator = {
  charSprite: Sprite;
  spriteTime: number;
  currentFrame: number;
  direction: number;
  currentSprite: string;
};

export type IGameState = {
  status: string;
  entities: IEntity[];
  stage: IStage;
};

export type GameStateAPI = {
  addEntity(e: IEntity): void;
  removeEntity(e: IEntity): void;
  getEntities(): IEntity[];
  getStage(): IStage;
};
