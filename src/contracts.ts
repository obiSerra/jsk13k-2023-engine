export type IVec = [number, number];
export interface IEntity {
  stage: IStage;
  hasRender: boolean;
  pos?: IVec;
  v?: IVec;
  box?: IVec;
  lastMv: IVec;
  isColliding: boolean;
  render?(): void;
  update?(delta: number): void;
  onCollide(e: IEntity): void;
}
export interface IStage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export type RenderFn = (ctx: CanvasRenderingContext2D, pos: IVec) => void;
