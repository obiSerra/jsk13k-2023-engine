export type IVec = [number, number];
export interface IEntity {
  pos: IVec;
  stage: IStage;
  render(): void;
  update(delta: number): void;
}

export interface IDynEntity extends IEntity {
  v: IVec;
}

export interface IStage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export type RenderFn = (ctx: CanvasRenderingContext2D, pos: IVec) => void;
