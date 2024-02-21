import { absPath } from 'core/common';
import {
  appendHandDistanceToText,
  backButtonTextureKey,
  backButtonTexturePath,
  buttonPinchSoundKey,
  buttonPinchSoundPath,
  standardButtonScale,
  calibrationBackgroundTextureKey,
  calibrationBackgroundTexturePath,
  calibrationButtonBottomLevel,
  calibrationMenuWebcamOpacity,
  calibrationTextTopLevel,
  handDistanceTextOptions,
  handDistanceTextShadowOptions,
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
  uiHoverColor,
  undefinedText,
  escapeKey,
  calibrationScene,
  mainMenuScene,
} from 'core/config';
import { PhaserText, Vector2 } from 'core/phaserTypes';
import HandScene from 'scenes/handScene';
import { Button } from 'ui/button';

export default class Calibration extends HandScene {
  private backToMenu: Button;
  private distanceText: PhaserText;

  constructor() {
    super(calibrationScene);
  }

  private exit() {
    this.scene.start(mainMenuScene);
  }

  preload() {
    this.load.image(backButtonTextureKey, absPath(backButtonTexturePath));
    this.load.audio(buttonPinchSoundKey, absPath(buttonPinchSoundPath));
    this.load.image(
      calibrationBackgroundTextureKey,
      absPath(calibrationBackgroundTexturePath),
    );
  }

  create() {
    super.create(true, calibrationMenuWebcamOpacity);

    // Not moving these to config was they depend on window size which can change.

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const horizontalCenter = 0.5 * windowWidth;

    this.backToMenu = new Button(
      this,
      new Vector2(
        horizontalCenter,
        windowHeight * calibrationButtonBottomLevel,
      ),
      standardButtonScale,
      backButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );

    this.setBackgroundTexture(calibrationBackgroundTextureKey);

    this.input.keyboard!.on(escapeKey, () => {
      this.exit();
    });

    this.distanceText = this.add
      .text(
        horizontalCenter,
        windowHeight * calibrationTextTopLevel,
        undefinedText,
        {
          color: handDistanceTextOptions.color,
          font: handDistanceTextOptions.font,
        },
      )
      .setShadow(
        handDistanceTextShadowOptions.x,
        handDistanceTextShadowOptions.y,
        handDistanceTextShadowOptions.color,
        handDistanceTextShadowOptions.blur,
      )
      .setOrigin(0.5, 0.5);

    this.backToMenu.addPinchCallbacks({
      startPinch: () => {
        this.exit();
      },
      startHover: () => {
        this.backToMenu.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.backToMenu.clearTint();
      },
    });
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

      this.setBackgroundTint(handDistanceColor);

      if (appendHandDistanceToText) {
        handDistanceText +=
          handDistance.toFixed(0) + ' ' + handDistanceUnitText;
      }
    } else {
      this.clearBackgroundTint();
    }

    if (this.distanceText != undefined && this.distanceText.active) {
      this.distanceText.setText(handDistanceText);
    }
  }
}
