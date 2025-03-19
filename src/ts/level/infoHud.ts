import { TextOptions } from '../core/interfaces';
import { assert } from '../core/common';
import Level from '../level/level';
import { config } from '../managers/storageManager';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import { GameObject, PhaserText, Sprite, Vector2 } from '../core/phaserTypes';
import {
  bpmInfoText,
  difficultyInfoText,
  difficultyTextEasy,
  difficultyTextHard,
  difficultyTextMedium,
  layerDividerSymbol,
  layerInfoText,
  loopInfoText,
  trackInfoText,
  undefinedText,
} from '../core/config';
import setInteraction from '../util/interaction';

export default class InfoHUD extends GameObject {
  public readonly scene: HandScene;
  private readonly level: Level;

  private trackText: PhaserText;
  private difficultyText: PhaserText;
  private bpmText: PhaserText;
  private layerText: PhaserText;
  private loopText: PhaserText;
  private infoBackground: Sprite;
  private skipButton: Button;

  constructor(scene: HandScene, level: Level) {
    super(scene, 'infoHUD');
    this.scene = scene;
    this.level = level;
  }

  public setup() {
    this.addTexts();
    this.addSkipButton();
    this.setVisible(false);
  }

  private addSkipButton() {
    this.skipButton = new Button(
      this.scene,
      'SKIP LAYER',
      this.scene.width - 200,
      this.scene.height - 100,
      () => {
        setInteraction(this.skipButton, false);
        this.level.transitionLayers();
      },
    );
    this.updateSkipButtonAvailability(false);
  }

  public setVisible(visible: boolean) {
    if (this.trackText != undefined) this.trackText.setVisible(visible);
    if (this.difficultyText != undefined)
      this.difficultyText.setVisible(visible);
    if (this.bpmText != undefined) this.bpmText.setVisible(visible);
    if (this.layerText != undefined) this.layerText.setVisible(visible);
    if (this.loopText != undefined) this.loopText.setVisible(visible);
    if (this.infoBackground != undefined)
      this.infoBackground.setVisible(visible);
    if (this.skipButton != undefined) {
      this.skipButton.setVisible(visible);
      if (this.skipButton.text != undefined)
        this.skipButton.text.setVisible(visible);
    }

    this.updateSkipButtonAvailability(visible);
  }

  private addText(textOptions: TextOptions, text: string): PhaserText {
    return this.scene.add
      .text(textOptions.position.x, textOptions.position.y, text, {
        font: textOptions.font,
        color: textOptions.color,
      })
      .setScale(textOptions.scale)
      .setDepth(textOptions.depth);
  }

  private getLoopText(): string {
    const loopCount: number = this.level.score.getLoopCount();
    const loopName: string = loopInfoText + loopCount.toString();
    return loopName;
  }

  private addTexts() {
    this.loopText = this.addText(
      {
        position: new Vector2(
          0.85 * this.scene.width,
          0.22 * this.scene.height,
        ),
        color: 'white',
        font: '20px Arial',
        scale: 1,
        depth: 40,
      },
      this.getLoopText(),
    );
    const trackName: string = trackInfoText + this.level.track.data.displayName;
    this.trackText = this.addText(
      {
        position: new Vector2(
          0.85 * this.scene.width,
          0.02 * this.scene.height,
        ),
        color: 'white',
        font: '20px Arial',
        scale: 1,
        depth: 40,
      },
      trackName,
    );

    const layerName: string =
      layerInfoText +
      (this.level.activeLayerIndex + 1).toString() +
      layerDividerSymbol +
      this.level.playableLayers.length.toString();

    let difficulty: string = undefinedText;
    switch (this.level.bpmIndex) {
      case 0: {
        difficulty = difficultyTextEasy;
        break;
      }
      case 1: {
        difficulty = difficultyTextMedium;
        break;
      }
      case 2: {
        difficulty = difficultyTextHard;
        break;
      }
      default: {
        break;
      }
    }

    assert(
      difficulty != undefinedText,
      'Extend the switch statement to have a difficulty text for the given track bpmIndex',
    );

    this.difficultyText = this.addText(
      {
        position: new Vector2(
          0.85 * this.scene.width,
          0.07 * this.scene.height,
        ),
        color: 'white',
        font: '20px Arial',
        scale: 1,
        depth: 40,
      },
      difficultyInfoText + difficulty,
    );

    this.bpmText = this.addText(
      {
        position: new Vector2(
          0.85 * this.scene.width,
          0.12 * this.scene.height,
        ),
        color: 'white',
        font: '20px Arial',
        scale: 1,
        depth: 40,
      },
      bpmInfoText + this.level.track.getBPM(),
    );

    this.layerText = this.addText(
      {
        position: new Vector2(
          0.85 * this.scene.width,
          0.17 * this.scene.height,
        ),
        color: 'white',
        font: '20px Arial',
        scale: 1,
        depth: 40,
      },
      layerName,
    );

    this.infoBackground = this.scene.add
      .sprite(this.scene.width, 0, 'trackInfoBackground')
      .setAlpha(0.3)
      .setOrigin(1, 0);
  }

  public updateLoopText() {
    this.loopText.setText(this.getLoopText());
    this.updateSkipButtonAvailability(true);
  }

  private updateSkipButtonAvailability(visible: boolean) {
    const available: boolean =
      config.enableSkipButton &&
      this.level.score.getLoopCount() >= config.skipLoopThreshold &&
      visible;
    if (this.skipButton != undefined) {
      setInteraction(this.skipButton, available);
    }
  }
}
