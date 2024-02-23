import { absPath, listLevelDirectories } from '../core/common';
import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import Level from '../level/level';
import { Sprite, Vector2 } from '../core/phaserTypes';
import {
  buttonPinchSoundKey,
  buttonPinchSoundPath,
  calibrationScene,
  levelListPath,
  levelSelectScene,
  logoTextureKey,
  logoTexturePath,
  mainMenuButtonGap,
  mainMenuScene,
  mainMenubuttonTopLevel,
  menuCalibrateButtonTextureKey,
  menuCalibrateButtonTexturePath,
  menuSelectButtonTextureKey,
  menuSelectButtonTexturePath,
  optionsButtonTextureKey,
  optionsButtonTexturePath,
  optionsScene,
  standardButtonScale,
  uiHoverColor,
} from '../core/config';

export default class MainMenu extends HandScene {
  private menuLogo: Sprite | undefined;
  private menuSelectLevel: Button;
  private menuCalibrate: Button;
  private menuOptions: Button;

  private levels: Level[];

  constructor() {
    super(mainMenuScene);

    this.levels = [];
  }

  async preload() {
    super.preload();

    this.load.audio(buttonPinchSoundKey, absPath(buttonPinchSoundPath));
    this.load.image(logoTextureKey, absPath(logoTexturePath));
    this.load.image(optionsButtonTextureKey, absPath(optionsButtonTexturePath));
    this.load.image(
      menuSelectButtonTextureKey,
      absPath(menuSelectButtonTexturePath),
    );
    this.load.image(
      menuCalibrateButtonTextureKey,
      absPath(menuCalibrateButtonTexturePath),
    );

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

    // TODO: Call this.level.unloadTrack(this) somewhere.
  }

  create() {
    super.create();

    this.levels.forEach((level: Level) => {
      level.setBPM(0);
    });

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const horizontalCenter = 0.5 * windowWidth;

    this.menuCalibrate = new Button(
      this,
      new Vector2(
        horizontalCenter - windowWidth * mainMenuButtonGap,
        mainMenubuttonTopLevel * windowHeight,
      ),
      standardButtonScale,
      menuCalibrateButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );

    if (this.levels.length > 0) {
      this.menuSelectLevel = new Button(
        this,
        new Vector2(horizontalCenter, mainMenubuttonTopLevel * windowHeight),
        standardButtonScale,
        menuSelectButtonTextureKey,
        buttonPinchSoundKey,
        true,
      );
      this.menuSelectLevel.addPinchCallbacks({
        startPinch: () => {
          this.scene.start(levelSelectScene, this.levels);
        },
        startHover: () => {
          this.menuSelectLevel.setTintFill(uiHoverColor);
        },
        endHover: () => {
          this.menuSelectLevel.clearTint();
        },
      });
    }

    this.menuOptions = new Button(
      this,
      new Vector2(
        horizontalCenter + windowWidth * mainMenuButtonGap,
        mainMenubuttonTopLevel * windowHeight,
      ),
      standardButtonScale,
      optionsButtonTextureKey,
      buttonPinchSoundKey,
      true,
    );

    this.menuLogo = this.add
      .sprite(0, 0, logoTextureKey)
      .setOrigin(0, 0)
      .setScale(0.7, 0.7);
    this.menuLogo.setPosition(
      horizontalCenter - this.menuLogo.displayWidth / 2,
      0.25 * windowHeight,
    );

    this.menuCalibrate.addPinchCallbacks({
      startPinch: () => {
        this.scene.start(calibrationScene);
      },
      startHover: () => {
        this.menuCalibrate.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.menuCalibrate.clearTint();
      },
    });

    this.menuOptions.addPinchCallbacks({
      startPinch: () => {
        this.scene.start(optionsScene);
      },
      startHover: () => {
        this.menuOptions.setTintFill(uiHoverColor);
      },
      endHover: () => {
        this.menuOptions.clearTint();
      },
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
