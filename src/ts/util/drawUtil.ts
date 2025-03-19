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

  handTracker.forEachNormalizedLandmarkPosition((nPosition: Vector2) => {
    const size: Vector2 = new Vector2(
      graphics.scene.scale.width,
      graphics.scene.scale.height,
    );
    const position: Vector2 = nPosition.multiply(size);
    graphics.lineStyle(options.lineWidth, options.color, options.alpha);
    // graphics.strokeCircle(position.x, position.y, options.radius);
  }, handIndex);
}

export function drawHandLandmarkConnections(
  graphics: Graphics,
  options: LandmarkConnectionOptions,
  handIndex: HandIndex = 0,
) {
  graphics.setDepth(landmarkConnectionDepth);
  handConnections.forEach(connection => {
    const nPos1: Vector2 | undefined =
      handTracker.getNormalizedLandmarkPosition(connection[0], handIndex);
    if (nPos1 !== undefined) {
      const nPos2: Vector2 | undefined =
        handTracker.getNormalizedLandmarkPosition(connection[1], handIndex);
      if (nPos2 !== undefined) {
        const size: Vector2 = new Vector2(
          graphics.scene.scale.width,
          graphics.scene.scale.height,
        );
        const p1: Vector2 = nPos1.multiply(size);
        const p2: Vector2 = nPos2.multiply(size);
        graphics.lineStyle(options.lineWidth, options.color, options.alpha);
        graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
      }
    }
  });
}
