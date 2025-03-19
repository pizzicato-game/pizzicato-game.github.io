import {
  appendHandDistanceToText,
  calibrationMenuWebcamOpacity,
  handDistanceUnitText,
  handJustRightColor,
  handJustRightText,
  handNotFoundText,
  handTooCloseColor,
  handTooCloseText,
  handTooCloseThreshold,
  handTooFarColor,
  handTooFarText,
  handTooFarThreshold,
  undefinedText,
  escapeKey,
} from '../core/config';
import { PhaserText } from '../core/phaserTypes';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import { background } from './loadingScene';

export default class Calibration extends HandScene {
  private back: Button;
  private distanceText: PhaserText;

  constructor() {
    super('calibration');
  }

  private exit() {
    this.scene.start('mainMenu');
  }

  create() {
    super.create(true, calibrationMenuWebcamOpacity);

    this.back = new Button(this, this.center.x, 972, () => {
      this.exit();
    });

    this.setBackgroundTexture('calibrationBackground');

    this.input.keyboard!.on(escapeKey, () => {
      this.exit();
    });

    this.distanceText = this.add
      .text(this.center.x, this.height * 0.1, undefinedText, {
        color: 'white',
        font: '60px Arial',
      })
      .setShadow(5, 5, 'rgba(0,0,0,0.5)', 15);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    const handDistance: number = this.hand.calculateHandDistance();

    let handDistanceText: string = handNotFoundText;

    if (handDistance > 0) {
      let handDistanceColor: number = handJustRightColor;

      if (handDistance > handTooFarThreshold) {
        handDistanceText = handTooFarText;
        handDistanceColor = handTooFarColor;
      } else if (handDistance < handTooCloseThreshold) {
        handDistanceText = handTooCloseText;
        handDistanceColor = handTooCloseColor;
      } else {
        handDistanceText = handJustRightText;
      }

      background.setTint(handDistanceColor);

      if (appendHandDistanceToText) {
        handDistanceText +=
          handDistance.toFixed(0) + ' ' + handDistanceUnitText;
      }
    } else {
      background.clearTint();
    }

    if (this.distanceText != undefined && this.distanceText.active) {
      this.distanceText.setText(handDistanceText);
    }
  }
}
