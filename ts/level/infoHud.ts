import { TextOptions } from 'core/interfaces';
import { absPath, assert } from 'core/common';
import Level from 'level/level';
import { config } from 'managers/storageManager';
import HandScene from 'scenes/handScene';
import { Button } from 'ui/button';
import { GameObject, PhaserText, Sprite } from 'core/phaserTypes';
import {
  bpmInfoText,
  bpmTextOptions,
  difficultyInfoText,
  difficultyTextEasy,
  difficultyTextHard,
  difficultyTextMedium,
  difficultyTextOptions,
  infoBackgroundOptions,
  layerDividerSymbol,
  layerInfoText,
  layerTextOptions,
  loopInfoText,
  loopTextOptions,
  skipButtonOptions,
  trackInfoText,
  trackTextOptions,
  uiHoverColor,
  undefinedText,
} from 'core/config';
import setInteraction from 'util/interaction';

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
      skipButtonOptions.position,
      skipButtonOptions.scale,
      skipButtonOptions.textureKey,
      skipButtonOptions.soundKey,
      false,
    );
    this.skipButton.addPinchCallbacks({
      startPinch: () => {
        setInteraction(this.skipButton, false);
        this.level.transitionLayers();
      },
      startHover: () => {
        this.skipButton.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.skipButton.clearTint();
      },
    });
    this.updateSkipButtonAvailability();
  }

  public preload() {
    this.scene.load.image(
      skipButtonOptions.textureKey,
      absPath(skipButtonOptions.path),
    );
    this.scene.load.image(
      infoBackgroundOptions.textureKey,
      absPath(infoBackgroundOptions.path),
    );
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
    this.loopText = this.addText(loopTextOptions, this.getLoopText());
    const trackName: string = trackInfoText + this.level.track.data.displayName;
    this.trackText = this.addText(trackTextOptions, trackName);

    const layerName: string =
      layerInfoText +
      (this.level.activeLayerIndex + 1).toString() +
      layerDividerSymbol +
      this.level.playableLayers.length.toString();

    let difficultyText: string = undefinedText;
    switch (this.level.bpmIndex) {
      case 0: {
        difficultyText = difficultyTextEasy;
        break;
      }
      case 1: {
        difficultyText = difficultyTextMedium;
        break;
      }
      case 2: {
        difficultyText = difficultyTextHard;
        break;
      }
      default: {
        break;
      }
    }

    assert(
      difficultyText != undefinedText,
      'Extend the switch statement to have a difficulty text for the given track bpmIndex',
    );

    this.difficultyText = this.addText(
      difficultyTextOptions,
      difficultyInfoText + difficultyText,
    );

    this.bpmText = this.addText(
      bpmTextOptions,
      bpmInfoText + this.level.track.getBPM(),
    );

    this.layerText = this.addText(layerTextOptions, layerName);

    this.infoBackground = this.scene.add
      .sprite(
        infoBackgroundOptions.position.x,
        infoBackgroundOptions.position.y,
        infoBackgroundOptions.textureKey,
      )
      .setAlpha(infoBackgroundOptions.opacity)
      .setOrigin(0, 0)
      .setDisplaySize(
        infoBackgroundOptions.size.x,
        infoBackgroundOptions.size.y,
      );
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
    if (this.skipButton != undefined)
      setInteraction(this.skipButton, available);
  }
}
