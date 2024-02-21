import { HandLandmarkIndex } from 'objects/handLandmarks';
import { fingerColors, fingerSpriteDepth } from 'core/config';
import { MatterSprite, Scene } from 'core/phaserTypes';
import setInteraction from 'util/interaction';

export default class Finger extends MatterSprite {
  public readonly name: string;
  public readonly landmarkIndex: HandLandmarkIndex;

  constructor(
    scene: Scene,
    spriteKey: string,
    name: string,
    landmarkIndex: HandLandmarkIndex,
    spriteScale: number,
  ) {
    super(scene.matter.world, 0, 0, spriteKey, undefined, {
      render: {
        visible: true,
      },
    });

    this.name = name;
    this.landmarkIndex = landmarkIndex;

    this.scene.add.existing(this);

    this.setScale(spriteScale);
    this.setTint(fingerColors[this.name]);
    this.setDepth(fingerSpriteDepth);

    this.setCircle(this.displayWidth / 2, {
      label: this.name,
    });

    this.setSensor(true);

    setInteraction(this, false);
  }
}
