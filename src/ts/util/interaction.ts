import { MatterSprite } from '../core/phaserTypes';
import { Button } from '../ui/button';

export default function setInteraction(
  object: MatterSprite | Button,
  interactWithWorld: boolean,
  hitArea?: Phaser.Types.Input.InputConfiguration | unknown,
) {
  if (object == undefined) return;
  object.setVisible(interactWithWorld);
  if (Object.hasOwn(object, 'text') && (object as Button).text != undefined) {
    (object as Button).text!.setVisible(interactWithWorld);
  }
  if (interactWithWorld) {
    object.setInteractive(hitArea);
  } else {
    object.disableInteractive();
  }
}
