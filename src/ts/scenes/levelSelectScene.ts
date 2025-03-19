import { assert } from '../core/common';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import Level from '../level/level';
import { config } from '../managers/storageManager';
import { PhaserText, Sprite, Vector2, Video } from '../core/phaserTypes';
import {
  defaultDifficultyButtonIndex,
  escapeKey,
  levelPrefix,
  levelSelectBackgroundAudioFeintness,
  levelSelectDefaultLevel,
  undefinedText,
} from '../core/config';
import { ToggleButton } from '../ui/toggleButton';
import { DifficultyButton } from '../ui/difficultyButton';
import TimerEvent = Phaser.Time.TimerEvent;

export default class LevelSelect extends HandScene {
  private currentLevelIndex: number = levelSelectDefaultLevel;

  private play: Button;
  private previousLevel: Button;
  private nextLevel: Button;
  private back: Button;
  private mute: ToggleButton;
  private songName: PhaserText;
  // If no preview video is provided, this is set to a default sprite
  private videoPreview: Video | Sprite;
  private videoRefreshEvent: TimerEvent;
  private difficultyButtons: DifficultyButton[] = [];

  private videoOffsetY: number = 124;

  public levels: Level[] = [];

  constructor() {
    super('levelSelect');
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
  }

  create() {
    super.create();

    const levelChangeButtonOffsetX: number = 450;

    this.play = new Button(this, this.center.x, 0, () => {
      this.startLevel(this.getCurrentLevel());
    }).setOrigin(0.5, 0);
    this.previousLevel = new Button(
      this,
      this.center.x - levelChangeButtonOffsetX,
      0,
      () => {
        this.updateLevel(-1);
      },
      'levelChange',
    ).setOrigin(0.5, 0);
    this.nextLevel = new Button(
      this,
      this.center.x + levelChangeButtonOffsetX,
      0,
      () => {
        this.updateLevel(1);
      },
      'levelChange',
    ).setOrigin(0.5, 0);
    this.back = new Button(this, 0, this.height, () => {
      this.scene.start('mainMenu');
      this.exit();
    }).setOrigin(0, 1);
    this.mute = new ToggleButton(
      this,
      this.width,
      this.height,
      () => {
        this.mute.toggle();
      },
      'unmute',
      'mute',
    ).setOrigin(1, 1);

    this.input.keyboard!.on(escapeKey, () => {
      this.scene.start('mainMenu');
      this.exit();
    });

    const _videoBackground = this.add.sprite(
      this.center.x,
      this.center.y - this.videoOffsetY,
      'videoBackground',
    );

    const _song: Sprite = this.add
      .sprite(this.center.x, 0, 'songNameBackground')
      .setOrigin(0.5, 0);

    this.songName = this.add
      .text(this.center.x, 0, undefinedText, {
        font: '50px Courier New',
        color: 'white',
      })
      .setOrigin(0.5, 0);

    this.updateLevel(0);

    this.mute.addToggleCallback((state: boolean) => {
      this.setBackgroundAudioMute(!state);
    });
  }

  private exit() {
    this.stopAudio();
  }

  private startLevel(level: Level) {
    this.exit();
    this.scene.start('level', level);
  }

  private createDifficultyButtons(level: Level) {
    for (const button of this.difficultyButtons) {
      button.destroy();
    }
    this.difficultyButtons = [];

    const bpms: number[] = level.track.data.bpm;

    const difficultButtonY: number = 766;
    const difficultButtonOffsetX: number = 384;

    const positions: Vector2[] = [
      new Vector2(this.center.x - difficultButtonOffsetX, difficultButtonY),
      new Vector2(this.center.x, difficultButtonY),
      new Vector2(this.center.x + difficultButtonOffsetX, difficultButtonY),
    ];

    assert(
      positions.length >= bpms.length,
      'positions array length must at least match the number of track bpms',
    );

    for (let i = 0; i < bpms.length; i++) {
      const difficultyButton: DifficultyButton = new DifficultyButton(
        i,
        bpms[i],
        this,
        positions[i].x,
        positions[i].y,
        () => {
          for (const button of this.getDifficultyButtons()) {
            if (button != difficultyButton) {
              button.setToggleState(false);
            }
          }
          difficultyButton.setToggleState(true);
        },
        'button',
        'button',
        i == defaultDifficultyButtonIndex,
      );

      difficultyButton.addToggleCallback((state: boolean) => {
        difficultyButton.updateTint();
        if (state) {
          level.setBPM(difficultyButton.bpmIndex);
          this.startPreview(level);
        }
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
      this.videoPreview = this.add.video(
        this.center.x,
        this.center.y - this.videoOffsetY,
        level.getPreviewVideoKey(),
      );

      const speedMultiplier =
        level.track.data.bpm[level.bpmIndex] / level.track.data.bpm[0];
      if (this.videoPreview.video) {
        this.videoPreview.video.playbackRate = speedMultiplier;
      }
      this.videoPreview.play(true);
    } else {
      this.videoPreview = this.add.sprite(
        this.center.x,
        this.center.y - this.videoOffsetY,
        'defaultVideoBackground',
      );
    }
  }

  private startPreview(level: Level) {
    this.stopAudio();

    level.addBackgroundAudio(this, {
      loop: true,
      volume: config.backgroundMusicLevel * levelSelectBackgroundAudioFeintness,
    });
    level.playBackgroundAudio();
    level.setBackgroundAudioMute(this.mute.getToggleState());

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
