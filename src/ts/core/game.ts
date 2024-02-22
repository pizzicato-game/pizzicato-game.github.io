import Phaser from 'phaser'
import { LoadingScene, ElectronScene } from '../scenes/loadingScene'
import LevelScene from '../scenes/levelScene'
import MainMenu from '../scenes/mainMenuScene'
import LevelSelect from '../scenes/levelSelectScene'
import Options from '../scenes/optionsScene'
import Scoreboard from '../scenes/scoreboardScene'
import Calibration from '../scenes/calibrationScene'

/*
To add a new scene:
1. import MySceneClassName from "scenes/mySceneClassName";
2. Add it to the scene array inside of config (below).
3. Ensure you are calling super("MySceneClassName") in your scene's constructor. 
   Otherwise you will get the following error: "Scene not found for key: MySceneClassName"
4. (Optional) To start in your scene, set initialScene = "MySceneClassName" in config.ts.
*/

const config = {
  type: Phaser.WEBGL, // PHASER.CANVAS, PHASER.AUTO
  scale: { mode: Phaser.Scale.RESIZE },
  transparent: true,
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [ElectronScene, LoadingScene, MainMenu, Options, LevelSelect, LevelScene, Scoreboard, Calibration]
}

const _game = new Phaser.Game(config)
