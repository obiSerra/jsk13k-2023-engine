import { IEntity, IVec } from "./contracts";
import { BoxColliderComponent, PositionComponent } from "./entities";
import { mXs } from "./utils";

export const isCollide = (a: IVec, as: IVec, b: IVec, bs: IVec) => {
  const [ax, ay] = a;
  const [aw, ah] = as;
  const [bx, by] = b;
  const [bw, bh] = bs;

  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
};
export const resolveCollisions = (entities: IEntity[]) => {
  for (let i = 0; i < entities.length; i++) {
    const a = entities[i];
    for (let j = 0; j < entities.length; j++) {
      if (i !== j) {
        const b = entities[j];
        const willCollide = isCollide(
          [a.pos[0] + a.lastMv[0] * 1.5, a.pos[1] + a.lastMv[1] * 1.5],
          a.box,
          [b.pos[0] + b.lastMv[0] * 1.5, b.pos[1] + b.lastMv[1] * 1.5],
          b.box
        );
        const actualCollide = isCollide([a.pos[0], a.pos[1]], a.box, [b.pos[0], b.pos[1]], b.box);

        if (actualCollide && a.v) {
          let nPos: IVec = a.pos;
          do {
            const mvX = -a.lastMv[0] || 1;
            const mvY = -a.lastMv[0] || 1;
            nPos = [nPos[0] + mvX, nPos[1] + mvY];
          } while (isCollide(nPos, a.box, [b.pos[0], b.pos[1]], b.box));
          a.pos = nPos;
        } else if (!actualCollide && willCollide && a.v) {
          // Trigger on Collide!!!!
          a.onCollide(b);
        }
      }
    }
  }
};

export const resolveCollisionsComponent = (
  entities: IEntity[],
  onCollideOverride: (e: IEntity) => void | null = null
) => {
  for (let i = 0; i < entities.length; i++) {
    const a = entities[i];
    let aCollide = false;
    const {
      p: [aX, aY],
      lp: [aXl, aYl],
    } = a.getComponent<PositionComponent>("position");
    let { box: aBox, onCollide } = a.getComponent<BoxColliderComponent>("collider");

    if (onCollideOverride) onCollide = onCollideOverride;

    for (let j = 0; j < entities.length; j++) {
      if (i !== j) {
        const b = entities[j];
        const {
          p: [bX, bY],
          lp: [bXl, bYl],
        } = b.getComponent<PositionComponent>("position");
        const bBox = b.getComponent<BoxColliderComponent>("collider").box;
        // const willCollide = isCollide(
        //   [aX + mXs(aXv, 16), aY + mXs(aYv, 16)],
        //   a.box,
        //   [b.pos[0] + b.lastMv[0] * 1.5, b.pos[1] + b.lastMv[1] * 1.5],
        //   b.box
        // );
        const actualCollide = isCollide([aX, aY], aBox, [bX, bY], bBox);
        if (actualCollide && !!onCollide) {
          aCollide = true;
          onCollide(b);
        }

        // if (actualCollide && a.v) {
        //   let nPos: IVec = a.pos;
        //   do {
        //     const mvX = -a.lastMv[0] || 1;
        //     const mvY = -a.lastMv[0] || 1;
        //     nPos = [nPos[0] + mvX, nPos[1] + mvY];
        //   } while (isCollide(nPos, a.box, [b.pos[0], b.pos[1]], b.box));
        //   a.pos = nPos;
        // } else if (!actualCollide && willCollide && a.v) {
        //   // Trigger on Collide!!!!
        //   a.onCollide(b);
        // }
      }
    }

    a.getComponent<BoxColliderComponent>("collider").isColliding = aCollide;
  }
};
