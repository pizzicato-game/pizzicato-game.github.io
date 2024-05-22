import { absPath, assert } from '../core/common';
import {
  entireLayerProgressRequired,
  progressBarDepth,
  progressBarOptions,
  startingProgress,
} from '../core/config';
import { GameObject, Group, Scene, Sprite } from '../core/phaserTypes';

export default class Progress extends Group {
  private current_: number = startingProgress;
  // Number of nodes which must be pinched 'on time' before progressing to the next playable layer.
  // If >= nodes.length or == entireLayerProgressRequired, all layer nodes must be pinched (100% perfect completion).
  private requiredProgress: number = entireLayerProgressRequired;
  private nodeCount: number = 1; // Number of total nodes per layer. Default: 1 (placeholder until progress bar is setup).

  private tints: number[] = [];

  constructor(scene: Scene) {
    super(scene);
    assert(this.current_ >= 0);
    this.tints = [];
    this.scene.add.existing(this);
    this.setVisible(false);
  }

  public preload() {
    this.scene.load.image(
      progressBarOptions.key,
      absPath(progressBarOptions.path),
    );
  }

  public setup(
    initialProgress: number,
    nodeCount: number,
    requiredProgress: number,
    tints: number[],
  ) {
    assert(requiredProgress <= nodeCount);
    assert(
      tints.length === nodeCount,
      'Must pass tints equal in number to nodes',
    );
    assert(nodeCount > 0);
    assert(requiredProgress > 0);
    assert(initialProgress >= 0);

    this.current_ = initialProgress;
    this.nodeCount = nodeCount;
    this.tints = tints;
    this.requiredProgress = requiredProgress;

    const progressSpriteWidth: number =
      progressBarOptions.size.x / this.nodeCount;

    this.clear();

    this.createMultiple({
      quantity: this.nodeCount,
      key: progressBarOptions.key,
      visible: true,
      setXY: {
        x:
          progressBarOptions.position.x -
          progressBarOptions.size.x / 2 +
          progressSpriteWidth / 2,
        y: progressBarOptions.position.y + progressBarOptions.size.y / 2,
        stepX: progressSpriteWidth,
      },
    });

    this.propertyValueSet('displayWidth', progressSpriteWidth);
    this.propertyValueSet('displayHeight', progressBarOptions.size.y);

    this.setDepth(progressBarDepth);
    this.redraw();
  }

  // Resets only the player progress, not the entire progress bar.
  public setToStarting() {
    this.current_ = startingProgress;
    assert(this.current_ >= 0);
    this.redraw();
  }

  public redraw() {
    if (this.current <= this.nodeCount) {
      this.getChildren().forEach((child: GameObject, _index: number) => {
        (child as Sprite).clearTint();
      });

      const required: number =
        this.requiredProgress === entireLayerProgressRequired
          ? this.nodeCount
          : this.requiredProgress - 1;
      const achieved: number = this.current;

      this.getChildren().forEach((child: GameObject, index: number) => {
        const s: Sprite = child as Sprite;
        if (progressBarOptions.tintByNode) {
          s.setTint(this.tints[index]);
        }
        if (index < achieved) {
          if (index <= required) {
            s.setTint(progressBarOptions.completedTint);
          } else {
            s.setTint(progressBarOptions.extraTint);
          }
        }
        if (index === required) {
          if (achieved > required) {
            s.setTint(progressBarOptions.completedRequiredTint);
          } else {
            s.setTint(progressBarOptions.requiredTint);
          }
        }
      }, this);
    }
  }

  public canProgress(): boolean {
    const perfectCompletionRequired: boolean =
      this.requiredProgress === entireLayerProgressRequired;
    return (
      (perfectCompletionRequired && this.current >= this.nodeCount) ||
      (!perfectCompletionRequired && this.current >= this.requiredProgress)
    );
  }

  public changeBy(value: number) {
    // Constrain progress between 0 and this.nodeCount.
    this.current_ = Math.max(0, Math.min(this.current + value, this.nodeCount));
  }

  public get current() {
    return this.current_;
  }
}
