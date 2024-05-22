import { buttonDepth, buttonPinchFinger } from '../core/config';
import { PinchCallbacks } from '../core/interfaces';
import { AudioTrack, MatterSprite, Vector2 } from '../core/phaserTypes';
import { config } from '../managers/storageManager';
import HandScene from '../scenes/handScene';
import setInteraction from '../util/interaction';

export class Button extends MatterSprite {
  public readonly scene: HandScene;
  private sound: AudioTrack;

  constructor(
    scene: HandScene,
    position: Vector2,
    scale: Vector2,
    spriteKey: string,
    soundKey: string,
    interactable: boolean,
  ) {
    super(scene.matter.world, position.x, position.y, spriteKey, undefined, {
      render: {
        visible: true,
      },
      label: 'button-' + spriteKey,
    });
    this.scene = scene;

    this.scene.add.existing(this);

    this.sound = this.scene.sound.add(soundKey, {
      volume: config.sonificationLevel,
    });

    this.setSensor(true);
    this.setOrigin(0.5, 0.5);
    this.setScale(scale.x, scale.y);
    this.setDepth(buttonDepth);
    setInteraction(this, interactable);

    this.on('destroy', () => {
      this.scene.hand.removePinchCheck(buttonPinchFinger, this);
    });
  }

  public removePinchCallbacks() {
    this.scene.hand.removePinchCheck(buttonPinchFinger, this);
  }

  public addPinchCallbacks(pinchCallbacks: PinchCallbacks) {
    const onTriggerStart = () => {
      pinchCallbacks.startPinch?.();
      this.sound.play({
        volume: config.sonificationLevel,
      });
    };

    const newCallbacks: PinchCallbacks = {
      startPinch: onTriggerStart,
      pinched: pinchCallbacks.pinched,
      endPinch: pinchCallbacks.endPinch,
      startHover: pinchCallbacks.startHover,
      endHover: pinchCallbacks.endHover,
    };

    this.scene.hand.addPinchCheck(buttonPinchFinger, this, newCallbacks);

    this.on('pointerdown', newCallbacks.startPinch!);

    if (newCallbacks.startHover) {
      this.on('pointermove', newCallbacks.startHover);
    }

    if (newCallbacks.endHover) {
      this.on('pointerout', newCallbacks.endHover);
    }
  }
}
