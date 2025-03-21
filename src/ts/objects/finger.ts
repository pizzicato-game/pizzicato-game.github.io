import { HandLandmarkIndex } from '../objects/handLandmarks';
import { fingerColors, fingerSpriteDepth } from '../core/config';
import { MatterSprite, Scene } from '../core/phaserTypes';
import setInteraction from '../util/interaction';

export default class Finger extends MatterSprite {
  public readonly name: string;
  public readonly landmarkIndex: HandLandmarkIndex;
  public readonly normalizedRadius: number; // display width of the finger normalized to the screen width.
  private normalizedPosition_: [number, number] | null;

  public get normalizedPosition() {
    return this.normalizedPosition_;
  }

  public updatePosition(normalizedX: number, normalizedY: number) {
    this.normalizedPosition_ = [normalizedX, normalizedY];
    this.setPosition(
      normalizedX * this.scene.scale.width,
      normalizedY * this.scene.scale.height,
    );
  }

  constructor(
    scene: Scene,
    name: string,
    landmarkIndex: HandLandmarkIndex,
    spriteScale: number,
    spriteKey: string = 'finger',
  ) {
    super(scene.matter.world, 0, 0, spriteKey, undefined, {
      render: {
        visible: true,
      },
    });
    this.normalizedPosition_ = null;
    this.name = name;
    this.landmarkIndex = landmarkIndex;

    this.scene.add.existing(this);

    this.setScale(spriteScale);
    this.setTint(fingerColors[this.name]);
    this.setDepth(fingerSpriteDepth);

    const fingerRadius: number = this.displayWidth / 2;
    this.normalizedRadius = fingerRadius / scene.scale.width;

    this.setCircle(fingerRadius, {
      label: this.name,
    });

    this.setSensor(true);

    setInteraction(this, false);
  }
}
