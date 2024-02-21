import { difficultyButtonChosenTint } from 'core/config';
import { Vector2 } from 'core/phaserTypes';
import HandScene from 'scenes/handScene';
import { Button } from 'ui/button';

export class ToggleButton extends Button {
  protected toggleState: boolean;

  private onSpriteKey: string;
  private offSpriteKey: string;
  private toggleCallback?: (newToggleState: boolean) => void;

  constructor(
    scene: HandScene,
    position: Vector2,
    scale: Vector2,
    onSpriteKey: string,
    offSpriteKey: string,
    soundKey: string,
    interactable: boolean,
    initialState: boolean = true,
  ) {
    super(scene, position, scale, onSpriteKey, soundKey, interactable);
    this.onSpriteKey = onSpriteKey;
    this.offSpriteKey = offSpriteKey;
    this.toggleState = initialState;

    this.setTexture(this.getSpriteKey());
  }

  public setToggleState(newToggleState: boolean) {
    this.toggleState = newToggleState;
    this.setTexture(this.getSpriteKey());
    this.toggleCallback?.(this.toggleState);
  }

  public addToggleCallback(toggleCallback: (newToggleState: boolean) => void) {
    this.toggleCallback = toggleCallback;
    this.toggleCallback(this.toggleState);
  }

  public toggle() {
    this.toggleState = !this.toggleState;
    this.setTexture(this.getSpriteKey());
    this.toggleCallback?.(this.toggleState);
  }

  public getToggleState(): boolean {
    return this.toggleState;
  }

  public updateTint() {
    if (this.toggleState) {
      this.setTintFill(difficultyButtonChosenTint);
    } else {
      this.clearTint();
    }
  }

  private getSpriteKey() {
    return this.toggleState ? this.onSpriteKey : this.offSpriteKey;
  }
}
