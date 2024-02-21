import { MatterSprite } from 'core/phaserTypes';

export default function setInteraction(
  object: MatterSprite,
  interactWithWorld: boolean,
) {
  if (object == undefined) return;
  object.setVisible(interactWithWorld);
  if (interactWithWorld) {
    object.setInteractive();
  } else {
    object.disableInteractive();
  }
}
