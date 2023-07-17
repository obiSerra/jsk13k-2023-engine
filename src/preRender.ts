import { IVec, RenderFn } from "./contracts";

// Pre-render a complex image inside a temporary canvas
export const preRender = (dim: IVec, renderFn: RenderFn) => {
  const prC = document.createElement("canvas");
  const [w, h] = dim;
  prC.width = w;
  prC.height = h;
  const ctx = prC.getContext("2d");
  renderFn(ctx, [prC.width / 2, prC.height / 2]);
  const imgSrc = prC.toDataURL("image/png");
  const img = document.createElement("img");
  img.src = imgSrc;
  return img;
};
