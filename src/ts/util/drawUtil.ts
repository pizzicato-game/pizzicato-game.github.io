import { handConnections } from '../objects/handConnections';
import { HandIndex } from '../objects/handLandmarks';
import handTracker from '../objects/handTracker';
import { LandmarkConnectionOptions, LandmarkOptions } from '../core/interfaces';
import { landmarkConnectionDepth, landmarkDepth } from '../core/config';
import { Graphics, Vector2 } from '../core/phaserTypes';

export function drawHandLandmarks(
  graphics: Graphics,
  options: LandmarkOptions,
  handIndex: HandIndex = 0,
) {
  graphics.setDepth(landmarkDepth);
  handTracker.forEachLandmarkPosition((position: Vector2) => {
    graphics.lineStyle(options.lineWidth, options.color, options.alpha);
    graphics.strokeCircle(position.x, position.y, options.radius);
  }, handIndex);
}

export function drawHandLandmarkConnections(
  graphics: Graphics,
  options: LandmarkConnectionOptions,
  handIndex: HandIndex = 0,
) {
  graphics.setDepth(landmarkConnectionDepth);
  handConnections.forEach(connection => {
    const pos1: Vector2 | undefined = handTracker.getLandmarkPosition(
      connection[0],
      handIndex,
    );
    if (pos1 !== undefined) {
      const pos2: Vector2 | undefined = handTracker.getLandmarkPosition(
        connection[1],
        handIndex,
      );
      if (pos2 !== undefined) {
        graphics.lineStyle(options.lineWidth, options.color, options.alpha);
        graphics.lineBetween(pos1.x, pos1.y, pos2.x, pos2.y);
      }
    }
  });
}
