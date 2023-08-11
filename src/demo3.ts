import { resolveCollisions } from "./api/collisions";
import { BoxColliderComponent, PositionComponent, SpriteRenderComponent } from "./api/components";
import { ComponentType, GameStateAPI, IComponent, IEntity, IStage, Sprite } from "./api/contracts";
import { ComponentBaseEntity } from "./api/entities";
import { GameState } from "./api/gameState";
import { flipImage, genDrawCharacter, hydrateImage, preRender } from "./api/rendering";
import { Stage } from "./api/stage";
import { images } from "./pxImages/testImage";

// This is a basic Control Component
export class BaseControlComponent implements IComponent {
  type: ComponentType;
  downButtons: Set<string>;
  clickedDown: Set<string>;
  clickedUp: Set<string>;
  constructor() {
    this.type = "control";

    this.downButtons = new Set();
    this.clickedDown = new Set();
    this.clickedUp = new Set();
  }
  onInit(e: IEntity): void {
    document.addEventListener("keydown", e => {
      this.clickedDown.add(e.key);
    });
    document.addEventListener("keyup", e => {
      this.clickedUp.add(e.key);
      this.downButtons = new Set(Array.from(this.downButtons).filter(k => k !== e.key));
    });
  }
}

// This is a player that will allow the player to move left and right
export class PlayerControlComponent extends BaseControlComponent {
  onUpdate(e: IEntity, delta: number, gameState?: GameStateAPI): void {
    const pos = e.components["position"] as PositionComponent;
    const sprite = e.components["render"] as SpriteRenderComponent;
    const player = e as DemoPlayer;

    this.downButtons = new Set([...this.downButtons, ...this.clickedDown].filter(x => !this.clickedUp.has(x)));

    if (this.downButtons.has("ArrowLeft")) {
      player.walkLeft();
    } else if (this.downButtons.has("ArrowRight")) {
      player.walkRight();
    } else {
      player.stand();
    }

    this.clickedDown.clear();
    this.clickedUp.clear();
  }
}

class DemoPlayer extends ComponentBaseEntity {
  constructor(stage: IStage, sprite: Sprite) {
    super(stage, []);
    const position = new PositionComponent([stage.canvas.width / 2, stage.canvas.height / 2]);

    const renderer = new SpriteRenderComponent(sprite, "idle");
    const control = new PlayerControlComponent();
    const box = new BoxColliderComponent([32, 32], () => {
      const pos = this.components["position"] as PositionComponent;
      pos.p = [...pos.lp];
    });

    this.addComponent(position);
    this.addComponent(renderer);
    this.addComponent(control);
    this.addComponent(box);
  }
  walkLeft() {
    const pos = this.components["position"] as PositionComponent;
    const rend = this.components["render"] as SpriteRenderComponent;
    if (rend.currentAnimation !== "run") rend.setupAnimation("run");
    pos.p[0] -= 10;
    pos.direction = 1;
  }
  walkRight() {
    const pos = this.components["position"] as PositionComponent;
    const rend = this.components["render"] as SpriteRenderComponent;
    if (rend.currentAnimation !== "runRight") rend.setupAnimation("runRight");
    pos.p[0] += 10;
    pos.direction = -1;
  }
  stand() {
    const pos = this.components["position"] as PositionComponent;
    const rend = this.components["render"] as SpriteRenderComponent;
    if (pos.direction === 1 && rend.currentAnimation !== "idle") rend.setupAnimation("idle");
    if (pos.direction === -1 && rend.currentAnimation !== "idleRight") rend.setupAnimation("idleRight");
  }
}

class EnemyEntity extends ComponentBaseEntity {
  constructor(stage: IStage, sprite: Sprite) {
    super(stage, []);
    const position = new PositionComponent([200, stage.canvas.height / 2]);
    position.direction = -1;

    const renderer = new SpriteRenderComponent(sprite, "idleRight");
    const box = new BoxColliderComponent([32, 32]);

    this.addComponent(position);
    this.addComponent(renderer);
    this.addComponent(box);
  }
}

// class Bolt extends BaseEntity {
//   constructor(sprite, ...args: ConstructorParameters<typeof BaseEntity>) {
//     super(...args);

//     const sa = { charSprite: sprite, spriteTime: 0, currentFrame: 0, direction: 1, currentSprite: "idle" };
//     this.setSpriteAnimator(sa);
//   }
//   update(d: number, gameStateApi: GameStateAPI) {
//     const [x, y] = this.pos;
//     super.update(d);
//     if (x < 0 || x > this.stage.canvas.width || y < 0 || y > this.stage.canvas.height) {
//       gameStateApi.removeEntity(this);
//     }
//   }
//   render(delta) {
//     this.spriteAnimator.spriteTime += delta;

//     const spriteName = this.spriteAnimator.currentSprite || "idle";
//     this.renderSprite(delta, spriteName);
//     super.render(delta);
//   }
// }

export function demo3(gameState: GameState) {
  gameState.setEntities([]);
  const { stage, gl } = gameState;
  const stateAPI = gameState.stateAPI();
  // Prepare images and sprites

  const boltIdr = hydrateImage(images, "bolt");
  const boltScaling = 2;
  const boltImg = preRender(
    [boltIdr.length * boltScaling, boltIdr[0].length * boltScaling],
    genDrawCharacter(hydrateImage(images, "bolt"), boltScaling)
  );

  const boltSprite: Sprite = {
    idle: { frames: [boltImg], changeTime: 500 },
  };
  // const bolt = new Bolt(boltSprite, stage, [stage.canvas.width / 2, stage.canvas.height / 2], [0, 0]);

  const img1 = hydrateImage(images, "img1");
  const img2 = hydrateImage(images, "img2");
  const img1R = flipImage(img1);
  const img2R = flipImage(img2);

  const idle1 = preRender([32, 32], genDrawCharacter(img1));
  const idle2 = preRender([32, 32], genDrawCharacter(img2));
  const idleR1 = preRender([32, 32], genDrawCharacter(img1R));
  const idleR2 = preRender([32, 32], genDrawCharacter(img2R));
  const img3 = hydrateImage(images, "img3");
  const img4 = hydrateImage(images, "img4");
  const img3R = flipImage(img3);
  const img4R = flipImage(img4);

  const run1 = preRender([32, 32], genDrawCharacter(img3));
  const run2 = preRender([32, 32], genDrawCharacter(img4));
  const run3 = preRender([32, 32], genDrawCharacter(img3R));
  const run4 = preRender([32, 32], genDrawCharacter(img4R));
  const charSprite: Sprite = {
    idle: { frames: [idle1, idle2], changeTime: 500 },
    idleRight: { frames: [idleR1, idleR2], changeTime: 500 },
    run: { frames: [run1, run2], changeTime: 100 },
    runRight: { frames: [run3, run4], changeTime: 100 },
  };

  // Add character
  const player = new DemoPlayer(stage, charSprite);
  gameState.addEntity(player);

  const enemy = new EnemyEntity(stage, charSprite);
  gameState.addEntity(enemy);

  gl.onUpdate(delta => {
    const canCollide = gameState.getEntities().filter(e => !!e.components["collider"]);

    // to update
    resolveCollisions(canCollide);
    gameState
      .getEntities()
      .filter(e => typeof e.update === "function")
      .forEach(e => e.update(delta, stateAPI));
  });

  gl.onRender(t => {
    gameState
      .getEntities()
      .filter(e => typeof e.render === "function")
      .forEach(e => e.render(t));
  });
}
