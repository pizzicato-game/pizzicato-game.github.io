import HandScene from '../scenes/handScene';
import Level from '../level/level';
import { escapeKey } from '../core/config';

export default class LevelScene extends HandScene {
  private level: Level;

  constructor() {
    super('level');
  }

  preload() {
    this.level = this.scene.settings.data as Level;
    this.level.init(this);
  }

  create() {
    super.create();

    if (this.level.hasCustomBackground()) {
      this.setBackgroundTexture(this.level.getBackgroundTextureKey());
    } else {
      this.setBackgroundTexture('levelBackground');
    }

    this.input.keyboard!.on(escapeKey, () => {
      this.level.abort();
    });

    this.level.start(
      () => {
        // Finished level callback.
        this.scene.start('scoreboard', this.level);
      },
      () => {
        // Aborted level callback.
        this.scene.start('mainMenu');
      },
    );
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.level.update(time);
  }
}
