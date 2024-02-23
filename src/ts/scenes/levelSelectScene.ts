import { absPath, assert } from '../core/common';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import Level from '../level/level';
import { config } from '../managers/storageManager';
import { PhaserText, Sprite, Vector2, Video } from '../core/phaserTypes';
import {
  backButtonTextureKey,
  backButtonTexturePath,
  buttonPinchSoundKey,
  defaultDifficultyButtonIndex,
  defaultLevelPreviewKey,
  defaultLevelPreviewPath,
  easyButtonTextureKey,
  easyButtonTexturePath,
  escapeKey,
  hardButtonTextureKey,
  hardButtonTexturePath,
  leftArrowTextureKey,
  leftArrowTexturePath,
  levelPrefix,
  levelScene,
  levelSelectBackgroundAudioFeintness,
  levelSelectButtonBottomLevel,
  levelSelectButtonGap,
  levelSelectButtonMidLevel,
  levelSelectDefaultLevel,
  levelSelectLeftButtonOffset,
  levelSelectLevelButtonGap,
  levelSelectRightButtonOffset,
  levelSelectScene,
  levelSelectSongNameOptions,
  levelSelectVideoOffset,
  levelSelectVideoScale,
  levelSelectbuttonTopLevel,
  mainMenuScene,
  mediumButtonTextureKey,
  mediumButtonTexturePath,
  muteButtonTextureKey,
  muteButtonTexturePath,
  playButtonTextureKey,
  playButtonTexturePath,
  previewVideoBackgroundTextureKey,
  previewVideoBackgroundTexturePath,
  rightArrowTextureKey,
  rightArrowTexturePath,
  songNameBackgroundTextureKey,
  songNameBackgroundTexturePath,
  standardButtonScale,
  uiHoverColor,
  undefinedText,
  unmuteButtonTextureKey,
  unmuteButtonTexturePath,
} from '../core/config';
import { ToggleButton } from '../ui/toggleButton';
import { DifficultyButton } from '../ui/difficultyButton';
import TimerEvent = Phaser.Time.TimerEvent;

export default class LevelSelect extends HandScene {
  private currentLevelIndex: number = levelSelectDefaultLevel;

  private play: Button;
  private previousLevel: Button;
  private nextLevel: Button;
  private backToMenu: Button;
  private muteButton: ToggleButton;
  private songName: PhaserText;
  // If no preview video is provided, this is set to a default sprite
  private videoPreview: Video | Sprite;
  private videoRefreshEvent: TimerEvent;
  private difficultyButtons: DifficultyButton[] = [];

  public levels: Level[] = [];

  constructor() {
    super(levelSelectScene);
    assert(
      this.currentLevelIndex >= 0,
      'Level select default level must be >= 0',
    );
  }

  preload() {
    this.levels = this.scene.settings.data as Level[];

    assert(
      this.currentLevelIndex < this.levels.length,
      'Cannot set defaut level select index above the number of levels',
    );

    this.load.image(easyButtonTextureKey, absPath(easyButtonTexturePath));
    this.load.image(mediumButtonTextureKey, absPath(mediumButtonTexturePath));
    this.load.image(hardButtonTextureKey, absPath(hardButtonTexturePath));

    this.load.image(muteButtonTextureKey, absPath(muteButtonTexturePath));
    this.load.image(unmuteButtonTextureKey, absPath(unmuteButtonTexturePath));
    this.load.image(backButtonTextureKey, absPath(backButtonTexturePath));
    this.load.image(playButtonTextureKey, absPath(playButtonTexturePath));

    this.load.image(leftArrowTextureKey, absPath(leftArrowTexturePath));
    this.load.image(rightArrowTextureKey, absPath(rightArrowTexturePath));

    this.load.image(defaultLevelPreviewKey, absPath(defaultLevelPreviewPath));
    this.load.image(
      previewVideoBackgroundTextureKey,
      absPath(previewVideoBackgroundTexturePath),
    );
    this.load.image(
      songNameBackgroundTextureKey,
      absPath(songNameBackgroundTexturePath),
    );
  }

  create() {
    super.create();

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const horizontalCenter = 0.5 * windowWidth;

    this.play = new Button(
      this,
      new Vector2(
        horizontalCenter,
        levelSelectButtonBottomLevel * windowHeight,
      ),
      standardButtonScale,
      playButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );
    this.previousLevel = new Button(
      this,
      new Vector2(
        horizontalCenter - windowWidth * levelSelectButtonGap,
        levelSelectbuttonTopLevel * windowHeight,
      ),
      new Vector2(0.4, 0.4),
      leftArrowTextureKey,
      buttonPinchSoundKey,
      true,
    );
    this.nextLevel = new Button(
      this,
      new Vector2(
        horizontalCenter + windowWidth * levelSelectButtonGap,
        levelSelectbuttonTopLevel * windowHeight,
      ),
      new Vector2(0.4, 0.4),
      rightArrowTextureKey,
      buttonPinchSoundKey,
      true,
    );
    this.backToMenu = new Button(
      this,
      new Vector2(
        horizontalCenter - windowWidth * levelSelectLeftButtonOffset,
        windowHeight * levelSelectButtonBottomLevel,
      ),
      standardButtonScale,
      backButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );
    this.muteButton = new ToggleButton(
      this,
      new Vector2(
        horizontalCenter + windowWidth * levelSelectRightButtonOffset,
        windowHeight * levelSelectButtonBottomLevel,
      ),
      new Vector2(1.5, 1.5),
      muteButtonTextureKey,
      unmuteButtonTextureKey,
      buttonPinchSoundKey,
      true,
      true,
    );

    this.input.keyboard!.on(escapeKey, () => {
      this.scene.start(mainMenuScene);
      this.exit();
    });

    const _videoBackground = this.add
      .sprite(
        window.innerWidth * 0.5,
        window.innerHeight * 0.5 - window.innerHeight * levelSelectVideoOffset,
        previewVideoBackgroundTextureKey,
      )
      .setScale(levelSelectVideoScale.x, levelSelectVideoScale.y)
      .setOrigin(0.5, 0.5);

    this.backToMenu.addPinchCallbacks({
      startPinch: () => {
        this.scene.start(mainMenuScene);
        this.exit();
      },
      startHover: () => {
        this.backToMenu.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.backToMenu.clearTint();
      },
    });

    this.play.addPinchCallbacks({
      startPinch: () => {
        this.startLevel(this.getCurrentLevel());
      },
      startHover: () => {
        this.play.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.play.clearTint();
      },
    });

    const _song: Sprite = this.add
      .sprite(
        horizontalCenter,
        windowHeight * levelSelectbuttonTopLevel,
        songNameBackgroundTextureKey,
      )
      .setTintFill(0x000000)
      .setScale(0.4, 0.4)
      .setOrigin(0.5, 0.5);

    this.songName = this.add
      .text(
        horizontalCenter,
        windowHeight * levelSelectbuttonTopLevel,
        undefinedText,
        {
          font: levelSelectSongNameOptions.font,
        },
      )
      .setColor(levelSelectSongNameOptions.color)
      .setOrigin(0.5, 0.5);

    this.updateLevel(0);

    this.previousLevel.addPinchCallbacks({
      startPinch: () => {
        this.updateLevel(-1);
      },
      startHover: () => {
        this.previousLevel.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.previousLevel.clearTint();
      },
    });

    this.nextLevel.addPinchCallbacks({
      startPinch: () => {
        this.updateLevel(+1);
      },
      startHover: () => {
        this.nextLevel.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.nextLevel.clearTint();
      },
    });

    this.muteButton.addToggleCallback((state: boolean) => {
      this.setBackgroundAudioMute(!state);
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
  }

  private exit() {
    this.stopAudio();
  }

  private startLevel(level: Level) {
    this.exit();
    this.scene.start(levelScene, level);
  }

  private createDifficultyButtons(level: Level) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const horizontalCenter = 0.5 * windowWidth;

    for (const button of this.difficultyButtons) {
      button.destroy();
    }
    this.difficultyButtons = [];

    const bpms: number[] = level.track.data.bpm;

    const buttonKeys: string[] = [
      easyButtonTextureKey,
      mediumButtonTextureKey,
      hardButtonTextureKey,
    ];

    const positions: Vector2[] = [
      new Vector2(
        horizontalCenter - windowWidth * levelSelectLevelButtonGap,
        levelSelectButtonMidLevel * windowHeight,
      ),
      new Vector2(horizontalCenter, levelSelectButtonMidLevel * windowHeight),
      new Vector2(
        horizontalCenter + windowWidth * levelSelectLevelButtonGap,
        levelSelectButtonMidLevel * windowHeight,
      ),
    ];

    assert(
      buttonKeys.length >= bpms.length,
      'buttonKeys array length must at least match the number of track bpms',
    );
    assert(
      positions.length >= bpms.length,
      'positions array length must at least match the number of track bpms',
    );

    for (let i = 0; i < bpms.length; i++) {
      const bpmIndex: number = i;
      const bpm: number = bpms[i];
      const buttonKey: string = buttonKeys[i];
      const position: Vector2 = positions[i];
      const isDefaultDifficultyButton: boolean =
        i == defaultDifficultyButtonIndex;
      const difficultyButton: DifficultyButton = new DifficultyButton(
        this,
        position,
        new Vector2(0.4, 0.4),
        buttonKey,
        buttonKey,
        buttonPinchSoundKey,
        true,
        bpmIndex,
        bpm,
        isDefaultDifficultyButton,
      );

      difficultyButton.addToggleCallback((state: boolean) => {
        difficultyButton.updateTint();
        if (state) {
          level.setBPM(difficultyButton.bpmIndex);
          this.startPreview(level);
        }
      });

      difficultyButton.addPinchCallbacks({
        startPinch: () => {
          for (const button of this.getDifficultyButtons()) {
            if (button != difficultyButton) {
              button.setToggleState(false);
            }
          }
          difficultyButton.setToggleState(true);
        },
        startHover: () => {
          difficultyButton.setTintFill(uiHoverColor);
        },
        endHover: () => {
          difficultyButton.updateTint();
        },
      });

      this.difficultyButtons.push(difficultyButton);
    }
  }

  private getDifficultyButtons(): DifficultyButton[] {
    return this.difficultyButtons;
  }

  private setBackgroundAudioMute(state: boolean) {
    for (const level of this.levels) {
      level.setBackgroundAudioMute(state);
    }
  }

  private startVideo(level: Level) {
    if (this.videoPreview != undefined) this.videoPreview.destroy();
    if (level.hasPreviewVideo()) {
      this.videoPreview = this.add
        .video(
          window.innerWidth * 0.5,
          window.innerHeight * 0.5 -
            window.innerHeight * levelSelectVideoOffset,
          level.getPreviewVideoKey(),
        )
        .setScale(levelSelectVideoScale.x, levelSelectVideoScale.y)
        .setOrigin(0.5, 0.5);

      const speedMultiplier =
        level.track.data.bpm[level.bpmIndex] / level.track.data.bpm[0];
      if (this.videoPreview.video) {
        this.videoPreview.video.playbackRate = speedMultiplier;
      }
      this.videoPreview.play(true);
    } else {
      this.videoPreview = this.add
        .sprite(
          window.innerWidth * 0.5,
          window.innerHeight * 0.5 -
            window.innerHeight * levelSelectVideoOffset,
          defaultLevelPreviewKey,
        )
        .setScale(levelSelectVideoScale.x, levelSelectVideoScale.y)
        .setOrigin(0.5, 0.5);
    }
  }

  private startPreview(level: Level) {
    this.stopAudio();

    level.addBackgroundAudio(this, {
      loop: true,
      volume: config.backgroundMusicLevel * levelSelectBackgroundAudioFeintness,
    });
    level.playBackgroundAudio();
    level.setBackgroundAudioMute(!this.muteButton.getToggleState());

    const loopTime = level.getAudioLoopTime() * 1000;
    this.videoRefreshEvent = this.time.addEvent({
      delay: loopTime,
      callback: () => {
        this.startVideo(level);
      },
      callbackScope: this,
      loop: true,
      startAt: loopTime,
    });
  }

  private stopAudio() {
    if (this.videoRefreshEvent) this.videoRefreshEvent.destroy();

    for (const level of this.levels) {
      level.removeBackgroundAudio(this);
    }
  }

  private updateLevel(cycleAmount: number) {
    this.cycleLevel(cycleAmount);
    const current = this.getCurrentLevel();
    this.songName.setText(current.track.data.displayName);
    assert(
      defaultDifficultyButtonIndex < current.track.data.bpm.length,
      'Default difficulty button index must be in range of default track BPM',
    );
    current.setBPM(defaultDifficultyButtonIndex);
    this.startPreview(current);
    this.createDifficultyButtons(current);
  }

  private cycleLevel(amount: number) {
    const levelCount: number = this.levels.length;
    // This mod wraps negative values to positive ones.
    this.currentLevelIndex =
      (((this.currentLevelIndex + amount) % levelCount) + levelCount) %
      levelCount;
  }

  private getCurrentLevel(): Level {
    assert(
      this.currentLevelIndex < this.levels.length,
      'Current level index out of range of this.levels array',
    );
    return this.levels[this.currentLevelIndex];
  }

  private getCurrentLevelKey(): string {
    return levelPrefix + (this.currentLevelIndex + 1).toString();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
