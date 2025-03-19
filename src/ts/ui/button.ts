import {
  buttonDepth,
  buttonHoverTint,
  buttonPinchFinger,
} from '../core/config';
import { PinchCallbacks } from '../core/interfaces';
import { AudioTrack, MatterSprite } from '../core/phaserTypes';
import { config } from '../managers/storageManager';
import HandScene from '../scenes/handScene';

export class Button extends MatterSprite {
  public readonly scene: HandScene;
  private sound: AudioTrack;

  constructor(
    scene: HandScene,
    x: number,
    y: number,
    onPinch: () => void = () => {},
    spriteKey: string = 'button',
    soundKey: string = 'pinch',
  ) {
    super(scene.matter.world, x, y, spriteKey, undefined, {
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
    this.setDepth(buttonDepth);

    this.setPinchCallbacks({
      startPinch: onPinch,
      startHover: () => {
        this.setTintFill(buttonHoverTint);
      },
      endHover: () => {
        this.clearTint();
      },
    });

    this.on('destroy', () => {
      this.scene.hand.removePinchCheck(buttonPinchFinger, this);
    });
  }

  public removePinchCallbacks() {
    this.scene.hand.removePinchCheck(buttonPinchFinger, this);
  }

  public setOnPinch(onPinch: () => void) {
    this.setPinchCallbacks({
      startPinch: onPinch,
      startHover: () => {
        this.setTintFill(buttonHoverTint);
      },
      endHover: () => {
        this.clearTint();
      },
    });
  }

  public setPinchCallbacks(pinchCallbacks: PinchCallbacks) {
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
