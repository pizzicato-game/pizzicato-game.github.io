import { absPath, listLevelDirectories } from '../core/common';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import Level from '../level/level';
import { Sprite } from '../core/phaserTypes';
import { levelListPath } from '../core/config';

export default class MainMenu extends HandScene {
  private title: Sprite;
  private calibration: Button;
  private levelSelect: Button;
  private options: Button;

  private levels: Level[];

  constructor() {
    super('mainMenu');

    this.levels = [];
  }

  async preload() {
    await listLevelDirectories(absPath(levelListPath)).then(trackNames => {
      trackNames.forEach((track: string, _index: number) => {
        this.levels.push(new Level(track));
      });

      // Levels are preloaded in the main menu to eliminate preload
      // buffering time when switching to level select.
      this.levels.forEach((level: Level) => {
        level.preloadTrack(this);
      });
    });

    // TODO: Call this.level.unloadTrack(this) somewhere?
  }

  create() {
    super.create();

    this.levels.forEach((level: Level) => {
      level.setBPM(0);
    });

    const buttonsY: number = 800;

    this.calibration = new Button(this, this.center.x - 300, buttonsY, () => {
      this.scene.start('calibration');
    });
    this.options = new Button(this, this.center.x + 300, buttonsY, () => {
      this.scene.start('options');
    });

    if (this.levels.length > 0) {
      this.levelSelect = new Button(this, this.center.x, buttonsY, () => {
        this.scene.start('levelSelect', this.levels);
      });
    }

    this.title = this.add.sprite(this.center.x, 270, 'title');
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
