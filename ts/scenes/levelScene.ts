import HandScene from 'scenes/handScene';
import Level from 'level/level';
import {
  defaultLevelBackgroundKey,
  defaultLevelBackgroundPath,
  escapeKey,
  levelScene,
  mainMenuScene,
  scoreboardScene,
} from 'core/config';
import { absPath } from 'core/common';

export default class LevelScene extends HandScene {
  private level: Level;

  constructor() {
    super(levelScene);
  }

  preload() {
    this.level = this.scene.settings.data as Level;
    this.level.init(this);
    this.load.image(
      defaultLevelBackgroundKey,
      absPath(defaultLevelBackgroundPath),
    );
  }

  create() {
    super.create();

    if (this.level.hasCustomBackground()) {
      this.setBackgroundTexture(this.level.getBackgroundTextureKey());
    } else {
      this.setBackgroundTexture(defaultLevelBackgroundKey);
    }

    this.input.keyboard!.on(escapeKey, () => {
      this.level.abort();
    });

    this.level.start(
      () => {
        // Finished level callback.
        this.scene.start(scoreboardScene, this.level);
      },
      () => {
        // Aborted level callback.
        this.scene.start(mainMenuScene);
      },
    );
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.level.update(time);
  }
}
