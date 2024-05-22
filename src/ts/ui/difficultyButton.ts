import { difficultyButtonChosenTint, undefinedText } from '../core/config';
import { PhaserText, Vector2 } from '../core/phaserTypes';
import HandScene from '../scenes/handScene';
import { ToggleButton } from '../ui/toggleButton';

const bpmTextOffset: number = 0.023;

export class DifficultyButton extends ToggleButton {
  private readonly bpmIndex_: number;
  private readonly bpm: number;
  private readonly bpmText: PhaserText;

  private readonly bpmTextOptions = {
    font: '20px Courier New',
    color: 0xffffff,
  };

  constructor(
    scene: HandScene,
    position: Vector2,
    scale: Vector2,
    onSpriteKey: string,
    offSpriteKey: string,
    soundKey: string,
    interactable: boolean,
    bpmIndex: number,
    bpm: number,
    initialState: boolean = true,
  ) {
    super(
      scene,
      position,
      scale,
      onSpriteKey,
      offSpriteKey,
      soundKey,
      interactable,
      initialState,
    );
    this.bpmIndex_ = bpmIndex;
    this.bpm = bpm;
    this.bpmText = this.scene.add.text(0, 0, undefinedText, {
      font: this.bpmTextOptions.font,
    });
    this.bpmText.setText('BPM: ' + this.bpm.toString());

    // Ensure position is set after text because text varies the displaySize.
    this.bpmText.setPosition(
      position.x - this.bpmText.displayWidth / 2,
      position.y -
        this.bpmText.displayHeight / 2 +
        window.innerHeight * bpmTextOffset,
    );

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
      this.bpmText.setTintFill(this.bpmTextOptions.color);
      this.clearTint();
    }
  }

  get bpmIndex() {
    return this.bpmIndex_;
  }
}
