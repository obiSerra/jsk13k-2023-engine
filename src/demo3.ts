import { resolveCollisions } from "./collisions";
import { GameStateAPI, IEntity, IGameState, Sprite } from "./contracts";
import { BaseEntity } from "./entities";
import { images } from "./pxImages/testImage";
import { genDrawCharacter, hydrateImage, preRender } from "./rendering";
import { Stage } from "./stage";

class AnimationTest extends BaseEntity {
  fire: boolean;
  boltSprite: Sprite;
  constructor(charSprite, ...args: ConstructorParameters<typeof BaseEntity>) {
    super(...args);
    this.fire = false;
    const sa = { charSprite, spriteTime: 0, currentFrame: 0, direction: 1, currentSprite: "idle" };
    this.setSpriteAnimator(sa);

    document.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") {
        this.v[0] = -70;

        this.spriteAnimator.direction = 1;
        this.spriteAnimator.currentSprite = "run";
      } else if (e.key === "ArrowRight") {
        this.v[0] = 70;

        this.spriteAnimator.currentSprite = "run";
        this.spriteAnimator.direction = -1;
      } else if (e.key === "Control") {
        this.fire = true;
      } else {
        // console.log("key", e.key);
      }
    });

    document.addEventListener("keyup", e => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        this.v[0] = 0;
        this.spriteAnimator.currentSprite = "idle";
      }
    });
  }
  render(delta) {
    this.spriteAnimator.spriteTime += delta;

    const spriteName = this.spriteAnimator.currentSprite || "idle";
    this.renderSprite(delta, spriteName);
    super.render(delta);
  }
  update(d: number, gameStateApi: GameStateAPI) {
    const [x, y] = this.pos;

    if (this.fire) this.doFire(gameStateApi);

    if (x < 0 || x > this.stage.canvas.width) {
      this.v[0] = -this.v[0];
    }
    if (y < 0 || y > this.stage.canvas.height) {
      this.v[1] = -this.v[1];
    }
    super.update(d);
  }
  onCollide(e: IEntity) {
    this.v = [-this.v[0], -this.v[1]];
  }
  doFire(gameStateApi: GameStateAPI) {
    const startSpace = 50 * -this.spriteAnimator.direction;
    const bolt = new Bolt(this.boltSprite, gameStateApi.getStage(), [this.pos[0] + startSpace, this.pos[1]], [0, 0]);
    bolt.spriteAnimator.direction = this.spriteAnimator.direction;
    bolt.box = [16, 16];
    bolt.v = [-this.spriteAnimator.direction * 400, 0];
    gameStateApi.addEntity(bolt);
    this.fire = false;
  }
}

class Bolt extends BaseEntity {
  constructor(sprite, ...args: ConstructorParameters<typeof BaseEntity>) {
    super(...args);

    const sa = { charSprite: sprite, spriteTime: 0, currentFrame: 0, direction: 1, currentSprite: "idle" };
    this.setSpriteAnimator(sa);
  }
  update(d: number, gameStateApi: GameStateAPI) {
    const [x, y] = this.pos;
    super.update(d);
    if (x < 0 || x > this.stage.canvas.width || y < 0 || y > this.stage.canvas.height) {
      gameStateApi.removeEntity(this);
    }
  }
  render(delta) {
    this.spriteAnimator.spriteTime += delta;

    const spriteName = this.spriteAnimator.currentSprite || "idle";
    this.renderSprite(delta, spriteName);
    super.render(delta);
  }
}

export function demo3(stage, gl) {
  // Prepare images and sprites
  const idle1 = preRender([32, 32], genDrawCharacter(hydrateImage(images, "img1")));
  const idle2 = preRender([32, 32], genDrawCharacter(hydrateImage(images, "img2")));
  const run1 = preRender([32, 32], genDrawCharacter(hydrateImage(images, "img3")));
  const run2 = preRender([32, 32], genDrawCharacter(hydrateImage(images, "img4")));
  const boltIdr = hydrateImage(images, "bolt");
  const boltScaling = 2;
  const boltImg = preRender(
    [boltIdr.length * boltScaling, boltIdr[0].length * boltScaling],
    genDrawCharacter(hydrateImage(images, "bolt"), boltScaling)
  );

  const boltSprite: Sprite = {
    idle: { frames: [boltImg], changeTime: 500 },
  };
  const bolt = new Bolt(boltSprite, stage, [stage.canvas.width / 2, stage.canvas.height / 2], [0, 0]);

  const charSprite: Sprite = {
    idle: { frames: [idle1, idle2], changeTime: 500 },
    run: { frames: [run1, run2], changeTime: 100 },
  };

  class GameState {
    status: string = "loading";
    entities: { [key: string]: IEntity } = {};
    stage: Stage;

    addEntity(e: IEntity) {
      this.entities[e.ID] = e;
    }
    removeEntity(e: IEntity) {
      delete this.entities[e.ID];
    }
    getEntities() {
      return Object.values(this.entities);
    }

    stateAPI(): GameStateAPI {
      return {
        addEntity: this.addEntity.bind(this),
        removeEntity: this.removeEntity.bind(this),
        getEntities: this.getEntities.bind(this),
        getStage: () => stage,
      };
    }
  }

  const state = new GameState();
  state.stage = stage;
  const stateAPI = state.stateAPI();

  // Add character

  const anim = new AnimationTest(charSprite, stage, [stage.canvas.width / 2, stage.canvas.height / 2], [0, 0]);
  anim.box = [32, 32];
  anim.boltSprite = boltSprite;
  state.addEntity(anim);

  gl.onUpdate(delta => {
    const canCollide = state.getEntities().filter(e => !!e.box);
    resolveCollisions(canCollide);
    state
      .getEntities()
      .filter(e => typeof e.update === "function")
      .forEach(e => e.update(delta, stateAPI));

    console.log("entities", state.getEntities().length);
  });
  gl.onRender(t => {
    state
      .getEntities()
      .filter(e => e.hasRender && typeof e.render === "function")
      .forEach(e => e.render(t));
  });
}
