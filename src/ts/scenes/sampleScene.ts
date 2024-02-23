import HandScene from '../scenes/handScene';

export default class SampleScene extends HandScene {
  constructor() {
    // Scene key
    super(/* sceneKey.toString() */ 'sample');
    // ...
  }

  preload() {
    super.preload();
    // ...
  }

  create() {
    super.create();
    // ...
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    // if ... this.scene.start('OtherSceneKey');
  }
}
