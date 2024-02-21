import { absPath } from 'core/common';
import HandScene from 'scenes/handScene';
import { Button } from 'ui/button';
import { config, saveToCSV } from 'managers/storageManager';
import { LevelStats } from 'core/interfaces';
import Level from 'level/level';
import { Sprite, Vector2 } from 'core/phaserTypes';
import {
  layerScoreBackgroundPath,
  layerScoreBackgroundTextureKey,
  saveCSVButtonTextureKey,
  saveCSVButtonTexturePath,
  scoreboardBackgroundPath,
  scoreboardBackgroundTextureKey,
  uiHoverColor,
} from 'core/config';
import { Vector2 } from 'core/phaserTypes';
import {
  backButtonTextureKey,
  backButtonTexturePath,
  buttonPinchSoundKey,
  buttonPinchSoundPath,
  escapeKey,
  mainMenuScene,
  muteButtonScale,
  muteButtonTextureKey,
  muteButtonTexturePath,
  scoreboardBackgroundAudioFeintness,
  scoreboardButtonBottomLevel,
  scoreboardButtonTopLevel,
  scoreboardRightButtonOffset,
  scoreboardScene,
  standardButtonScale,
  uiHoverColor,
  unmuteButtonTextureKey,
  unmuteButtonTexturePath,
} from 'core/config';

import { ToggleButton } from 'ui/toggleButton';
import setInteraction from 'util/interaction';
import { PlayableTrackLayerData } from 'level/trackTypes';

const buttonBottomLevel = 0.9;
const leftButtonOffset = 0.4;

const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || '';

export default class Scoreboard extends HandScene {
  private backToMenu: Button;
  private saveButton: Button;
  private muteButton: ToggleButton;
  private level: Level;
  private levelStats: LevelStats;

  constructor() {
    super(scoreboardScene);
  }

  private exit() {
    this.level.removeBackgroundAudio(this);
    this.scene.start(mainMenuScene);
  }

  preload() {
    this.load.audio(buttonPinchSoundKey, absPath(buttonPinchSoundPath));
    this.load.image(backButtonTextureKey, absPath(backButtonTexturePath));
    this.load.image(muteButtonTextureKey, absPath(muteButtonTexturePath));
    this.load.image(unmuteButtonTextureKey, absPath(unmuteButtonTexturePath));
    this.load.image(saveCSVButtonTextureKey, absPath(saveCSVButtonTexturePath));
    this.load.image(
      layerScoreBackgroundTextureKey,
      absPath(layerScoreBackgroundPath),
    );
    this.load.image(
      scoreboardBackgroundTextureKey,
      absPath(scoreboardBackgroundPath),
    );

    this.level = this.scene.settings.data as Level;
    this.levelStats = this.level.score.levelStats;
    if (config.autoSaveCSV) {
      saveToCSV(this.level.score.levelStats);
    }
  }

  create() {
    super.create();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const horizontalCenter = 0.5 * windowWidth;
    const scaleFactor = Math.min(windowWidth / 1920, windowHeight / 1080);

    this.backToMenu = new Button(
      this,
      new Vector2(horizontalCenter, windowHeight * scoreboardButtonTopLevel),
      standardButtonScale,
      backButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );

    this.muteButton = new ToggleButton(
      this,
      new Vector2(
        horizontalCenter + windowWidth * scoreboardRightButtonOffset,
        windowHeight * scoreboardButtonBottomLevel,
      ),
      muteButtonScale,
      muteButtonTextureKey,
      unmuteButtonTextureKey,
      buttonPinchSoundKey,
      true,
      true,
    );

    this.level.addBackgroundAudio(this, {
      loop: true,
      volume: config.backgroundMusicLevel * scoreboardBackgroundAudioFeintness,
    });
    this.level.playBackgroundAudio();

    this.muteButton.addToggleCallback((state: boolean) => {
      this.level.setBackgroundAudioMute(!state);
    });

    this.muteButton.addPinchCallbacks({
      startPinch: () => {
        this.muteButton.toggle();
      },
      startHover: () => {
        this.muteButton.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.muteButton.clearTint();
      },
    });

    this.input.keyboard!.on(escapeKey, () => {
      this.exit();
    });

    if (!config.autoSaveCSV) {
      this.saveButton = new Button(
        this,
        new Vector2(
          horizontalCenter - windowWidth * leftButtonOffset,
          windowHeight * buttonBottomLevel,
        ),
        new Vector2(0.6, 0.6),
        saveCSVButtonTextureKey,
        buttonPinchSoundKey,
        true,
      );

      this.saveButton.addPinchCallbacks({
        startPinch: () => {
          saveToCSV(this.levelStats);
          setInteraction(this.saveButton, false);
        },
        startHover: () => {
          this.saveButton.setTintFill(uiHoverColor);
        },
        endHover: () => {
          this.saveButton.clearTint();
        },
      });
    }

    //--------------------------------------------------------

    const scoreboardBackgroundOpacity: number = 0.6;

    const _background0l: Sprite = this.add
      .sprite(0, 0, scoreboardBackgroundTextureKey)
      .setOrigin(0.5, 0.5)
      .setScale(1.35 * scaleFactor, 1.25 * scaleFactor)
      .setAlpha(scoreboardBackgroundOpacity)
      .setPosition(horizontalCenter, windowHeight * 0.25);

    //--------------------------------------------------------

    // Title
    const title = this.add.text(horizontalCenter, 0, 'Scoreboard', {
      color: '#01c303',
      font: `${96 * scaleFactor}px Arial`,
    });
    title.setStroke('#000', 6 * scaleFactor);
    title.setPosition(horizontalCenter - title.width / 2, windowHeight * 0.07);

    const totalNotes = this.levelStats.layersStats.reduce(
      (sum, x) => sum + x.total,
      0,
    );
    const hitNotes = this.levelStats.layersStats.reduce(
      (sum, x) => sum + x.correct,
      0,
    );
    const missedNotes = this.levelStats.layersStats.reduce(
      (sum, x) => sum + x.miss,
      0,
    );
    const earlyNotes = this.levelStats.layersStats.reduce(
      (sum, x) => sum + x.early,
      0,
    );
    const lateNotes = this.levelStats.layersStats.reduce(
      (sum, x) => sum + x.late,
      0,
    );

    const infoText = this.add.text(
      horizontalCenter,
      0,
      `Total Correct: ${hitNotes.toString()}/${totalNotes.toString()}\nLongest Streak: ${
        this.levelStats.maxStreak
      }\nMissed: ${missedNotes}\nEarly: ${earlyNotes}\nLate: ${lateNotes}`,
      {
        color: '#ffffff',
        align: 'center',
        font: `${48 * scaleFactor}px Arial`,
      },
    );
    infoText.setPosition(
      horizontalCenter - infoText.width / 2,
      windowHeight * 0.19,
    );

    //------------------------------------------
    const layerBackgroundOffsets = [0.2 + 0.05, 0.5, 0.8 - 0.05];
    const layerTextOffsets = layerBackgroundOffsets;
    this.level.track.forEachLayer(
      undefined,
      (layer: PlayableTrackLayerData, i: number) => {
        this.add
          .sprite(0, 0, layerScoreBackgroundTextureKey)
          .setOrigin(0.5, 0.5)
          .setScale(1.35 * scaleFactor, 1.15 * scaleFactor)
          .setAlpha(scoreboardBackgroundOpacity)
          .setPosition(
            windowWidth * layerBackgroundOffsets[i],
            windowHeight * 0.63,
          );

        const layerTitle = this.add.text(0, 0, `${capitalize(layer.id)}`, {
          color: '#01c303',
          align: 'center',
          font: `${72 * scaleFactor}px Arial`,
          fontStyle: 'bold',
        });

        layerTitle.setStroke('#000', 4 * scaleFactor);

        layerTitle.setPosition(
          windowWidth * layerTextOffsets[i] - layerTitle.width / 2,
          windowHeight * 0.53,
        );
        const stats = this.levelStats.layersStats[i];
        let correct = 0;
        let total = 0;
        let loops = 0;
        if (stats != undefined) {
          correct = stats.correct;
          total = stats.total;
          loops = stats.loop;
        }

        const layerText = this.add.text(
          0,
          0,
          `\nCorrect: ${correct.toString()}/${total.toString()}\nLoops: ${loops.toString()}`,
          {
            color: '#ffffff',
            align: 'center',
            font: `${48 * scaleFactor}px Arial`,
          },
        );
        layerText.setPosition(
          windowWidth * layerTextOffsets[i] - layerText.width / 2,
          windowHeight * 0.575 + 0.01,
        );
      },
    );

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
  }
}
