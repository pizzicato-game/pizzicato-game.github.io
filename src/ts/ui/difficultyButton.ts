import { difficultyButtonChosenTint, undefinedText } from '../core/config';
import { PhaserText, Vector2 } from '../core/phaserTypes';
import HandScene from '../scenes/handScene';
import { ToggleButton } from '../ui/toggleButton';

export class DifficultyButton extends ToggleButton {
  private readonly bpmIndex_: number;
  private readonly bpm: number;
  private readonly bpmText: PhaserText;

  constructor(
    bpmIndex: number,
    bpm: number,
    scene: HandScene,
    x: number,
    y: number,
    onPinch: () => void = () => {},
    spriteKey: string,
    toggledSpriteKey: string,
    toggled: boolean = false,
    soundKey: string = 'pinch',
  ) {
    super(scene, x, y, onPinch, spriteKey, toggledSpriteKey, toggled, soundKey);
    this.bpmIndex_ = bpmIndex;
    this.bpm = bpm;
    this.bpmText = this.scene.add.text(0, 0, undefinedText, {
      font: '20px Courier New',
    });
    this.bpmText.setText('BPM: ' + this.bpm.toString());

    // Ensure position is set after text because text varies the displaySize.
    const textCenter: Vector2 = this.getCenter();

    this.bpmText.setPosition(textCenter.x, textCenter.y + 25);

    this.updateTint();

    this.on('destroy', () => {
      this.bpmText.destroy();
    });
  }

  public updateTint() {
    if (this.toggleState) {
      this.bpmText.setTintFill(difficultyButtonChosenTint);
      this.setTintFill(difficultyButtonChosenTint);
    } else {
      this.bpmText.setTintFill(0xffffff);
      this.clearTint();
    }
  }

  get bpmIndex() {
    return this.bpmIndex_;
  }
}
