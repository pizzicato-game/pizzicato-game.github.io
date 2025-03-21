import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import { config, saveToCSV, autoSaveToCSV } from '../managers/storageManager';
import { LevelStats } from '../core/interfaces';
import Level from '../level/level';
import { Sprite, Vector2 } from '../core/phaserTypes';
import { escapeKey, scoreboardBackgroundAudioFeintness } from '../core/config';

import { ToggleButton } from '../ui/toggleButton';
import { PlayableTrackLayerData } from '../level/trackTypes';

const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || '';

export default class Scoreboard extends HandScene {
  private back: Button;
  private save: Button;
  private mute: ToggleButton;
  private level: Level;
  private levelStats: LevelStats;

  constructor() {
    super('scoreboard');
  }
  private exit() {
    this.level.removeBackgroundAudio();
    this.scene.start('mainMenu');
  }

  preload() {
    this.level = this.scene.settings.data as Level;
    this.levelStats = this.level.score.levelStats;
    if (config.autoSaveCSV) {
      autoSaveToCSV(this.level.score.levelStats);
    }
  }

  create() {
    super.create();

    this.back = new Button(
      this,
      'BACK',
      this.center.x,
      this.height - 100,
      () => {
        this.exit();
      },
    );

    const muteOffset: Vector2 = new Vector2(150 / 2);
    this.mute = new ToggleButton(
      this,
      '',
      this.width - muteOffset.x,
      this.height - muteOffset.y,
      () => {
        this.mute.toggle();
      },
      'mute',
      'unmute',
      true,
    );

    this.level.addBackgroundAudio(this, {
      loop: true,
      volume: config.backgroundMusicVolume * scoreboardBackgroundAudioFeintness,
    });
    this.level.playBackgroundAudio();

    this.mute.addToggleCallback((state: boolean) => {
      this.level.setBackgroundAudioMute(!state);
    });

    this.input.keyboard!.on(escapeKey, () => {
      this.exit();
    });

    if (!config.autoSaveCSV) {
      this.save = new Button(this, 'SAVE CSV', 200, this.height - 100, () => {
        saveToCSV(this.levelStats);
        // Optionally hide the save CSV button after file is saved.
        //setInteraction(this.saveButton, false)
      });
    }

    //--------------------------------------------------------

    const scoreboardBackgroundOpacity: number = 0.6;

    const _background0l: Sprite = this.add
      .sprite(0, 0, 'scoreboardBackground1')
      .setScale(1.35, 1.25)
      .setAlpha(scoreboardBackgroundOpacity)
      .setPosition(this.center.x, this.height * 0.25);

    //--------------------------------------------------------

    // Title
    const title = this.add.text(this.center.x, 0, 'Scoreboard', {
      color: '#01c303',
      font: `${96}px Arial`,
    });
    title.setStroke('#000', 6);
    title.setPosition(this.center.x - title.width / 2, this.height * 0.07);

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
      this.center.x,
      0,
      `Total Correct: ${hitNotes.toString()}/${totalNotes.toString()}\nLongest Streak: ${
        this.levelStats.maxStreak
      }\nMissed: ${missedNotes}\nEarly: ${earlyNotes}\nLate: ${lateNotes}`,
      {
        color: '#ffffff',
        align: 'center',
        font: `${48}px Arial`,
      },
    );
    infoText.setPosition(
      this.center.x - infoText.width / 2,
      this.height * 0.19,
    );

    //------------------------------------------
    const layerBackgroundOffsets = [0.2 + 0.05, 0.5, 0.8 - 0.05];
    const layerTextOffsets = layerBackgroundOffsets;
    this.level.track.forEachLayer(
      undefined,
      (layer: PlayableTrackLayerData, i: number) => {
        this.add
          .sprite(0, 0, 'scoreboardBackground2')
          .setScale(1.35, 1.15)
          .setAlpha(scoreboardBackgroundOpacity)
          .setPosition(
            this.width * layerBackgroundOffsets[i],
            this.height * 0.63,
          );

        const layerTitle = this.add.text(0, 0, `${capitalize(layer.id)}`, {
          color: '#01c303',
          align: 'center',
          font: `${72}px Arial`,
          fontStyle: 'bold',
        });

        layerTitle.setStroke('#000', 4);

        layerTitle.setPosition(
          this.width * layerTextOffsets[i] - layerTitle.width / 2,
          this.height * 0.53,
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
            font: `${48}px Arial`,
          },
        );
        layerText.setPosition(
          this.width * layerTextOffsets[i] - layerText.width / 2,
          this.height * 0.575 + 0.01,
        );
      },
    );
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
