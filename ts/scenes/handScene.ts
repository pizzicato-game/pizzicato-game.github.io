import { Hand } from 'objects/hand';
import webcam from 'objects/webcam';
import { drawHandLandmarkConnections, drawHandLandmarks } from 'util/drawUtil';
import { assert } from 'core/common';
import { config } from 'managers/storageManager';
import { Graphics, Scene } from 'core/phaserTypes';
import {
  backgroundTextureKey,
  handLandmarkConnectionOptions,
  handLandmarkOptions,
  landmarkDepth,
} from 'core/config';
import { background } from 'scenes/loadingScene';

export default class HandScene extends Scene {
  public graphics: Graphics;
  public hand: Hand;

  constructor(sceneKey: string) {
    super(sceneKey);
  }

  public preload() {}

  public create(
    cameraVisibility: boolean = config.enableCameraVisibility,
    cameraOpacity: number = config.cameraOpacity,
  ) {
    webcam.setVisibility(cameraVisibility);

    // These calls are required because calibration scene hides, tints, and re-textures the background.
    background.setVisible(true);
    this.clearBackgroundTint();
    this.setBackgroundTexture(backgroundTextureKey);
    this.setOpacity(cameraOpacity);

    this.sound.pauseOnBlur = false;

    this.graphics = this.add.graphics();
    this.graphics.setDepth(landmarkDepth);

    this.hand = new Hand(this);
  }

  public update(_time: number, _delta: number) {
    this.graphics.clear();

    this.hand.update();

    drawHandLandmarks(this.graphics, handLandmarkOptions, 0);
    drawHandLandmarkConnections(
      this.graphics,
      handLandmarkConnectionOptions,
      0,
    );

    // TODO: When the hand goes off screen, phaser graphics has nothing to render and does
    // some sort of strange coordinate system offseting which causes a noticeable
    // shift of the game sprites. Might be fixed by resizing canvas continuously here.

    // This fixes a thin line on the bottom of the screen due to webcam being in the background.
    background.setDisplaySize(
      document.body.clientWidth,
      document.body.clientHeight + 1,
    );
  }

  public setOpacity(cameraOpacity: number) {
    assert(cameraOpacity >= 0 && cameraOpacity <= 1);
    background.setAlpha(1 - cameraOpacity);
  }

  public setBackgroundTexture(textureKey: string) {
    // TODO: Add assert that textureKey is loaded.
    background.setTexture(textureKey);
  }

  public setBackgroundTint(color: number) {
    background.setTint(color);
  }

  public clearBackgroundTint() {
    background.clearTint();
  }
}
